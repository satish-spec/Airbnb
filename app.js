if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}
console.log(process.env.SECRET);

const express= require("express");
const app= express();
const mongoose= require("mongoose");
// const Listing= require("./models/listing.js");
const path= require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");
// const wrapAsync = require("./utils/WrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const {listingSchema, reviewSchema} = require("./schema.js");
// const Review = require("./models/review.js");
// const review = require("./models/review.js"); 
const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const dbUrl = process.env.ATLASDB_URL;

const store = new MongoStore({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 36000,
})
store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });
async function main() {
    await mongoose.connect(dbUrl);
}

// app.get("/", (req,res) => {
//     res.send("Hi, I am root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());//user se related jitne bhi info. hai usko ham 
//session ke ander store karwate hai. Toh user ko baar-baar login nahi kana padega
passport.deserializeUser(User.deserializeUser()); //user info. ko unstored karwate hai session se
                                                // usko deserialize bolte hai




//global middleware i.e run on every request
//return an array of messages
//After reading deleted from session
app.use((req, res, next) => {//middleware to make data available to all your views automatically
    res.locals.success = req.flash("success");//data stored here is available in EJS(any view)
    res.locals.error = req.flash("error");//No need to manually send it in res.render()
    res.locals.currUser = req.user;//bcz ejs template me req.user assessible nahi kar sakte
    // console.log(res.locals.success);
    next();
})

// app.get("/demouser", async(req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });
//     let registeredUser = await User.register(fakeUser, "password");  //User ka jo register method 
//     //hai ye database ke ander automatically hamara jo fake user hai usko save karwa dega
//     res.send(registeredUser);
// }) 

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
    // res.send("something went wrong")
    let {statusCode=500, message="Something went wrong"} = err; 
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", {err});
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});


