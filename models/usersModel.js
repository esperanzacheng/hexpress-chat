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
    profilePicture: {
        type: String,
        default: "",
    },
    status: {
        type: String,
        default: "",
    },
    house: {
        type: String,
        default: "",
    },
    patronus: {
        type: String,
        default: "",
    },
    friends: {
        type: Array,
        default: "",
    },
    cars: [{
        car_name: {
            type:String
        }
    }],
},
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);