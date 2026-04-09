const mongoose= require("mongoose");
const Review = require("./review");
const Schema= mongoose.Schema;

const listingSchema= new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    // category: {
    //     type: String,
    //     enum: ["mountains", "rooms", 'farms', "artic"]
    // }
});

//This is mongoose middleware
listingSchema.post("findOneAndDelete", async(listing) => {  //middleware hai jab delete route 
    if(listing){                                            //call hoga listing.js se tab ye 
      await Review.deleteMany({_id: {$in: listing.reviews}}); // automatically exexute ho jaaega
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;



