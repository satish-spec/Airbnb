// const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
})

userSchema.plugin(passportLocalMongoose);//ye automatically username, hashing, salting and hash
                                        //password ko implement kar deta hai
                                    //Hame kuch bhi scratch se build karne ki jarurat nahi hai
module.exports = mongoose.model('User', userSchema);


