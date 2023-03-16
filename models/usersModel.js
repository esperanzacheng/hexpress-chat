const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        min: 3,
        max: 20,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        min: 6,
    },
    verified: {
        type: Boolean,
    },
    profilePicture: {
        type: String,
    },
    status: {
        type: String,
    },
    house: {
        type: String,
    },
    patronus: {
        type: String, 
    },
    friends: [{
        verified: Boolean,
        sender: Boolean
    }],
    chats: {
        type: Array,
    },
    cars: {
        type: Array,
    },
},
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);