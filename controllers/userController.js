const User = require('../models/usersModel')
const Car = require('../models/carsModel')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const config = require('../config/config');
const SECRET = config.jwtKey

exports.getAllUser = async(req, res, next) => {
    try {
        if (req.headers["cookie"]) {
            const authHeader = req.headers["cookie"];
            const token = authHeader.split("=")[1];
            const user = jwt.verify(token, SECRET);
            if (user) {
                const allUser = await User.find({});
                const allUserName = []
                allUser.forEach(e => { 
                    allUserName.push(e['username'])
                })
                res.status(200).json(allUserName);
            } else {
                res.status(400).json("token is invalid");
            }
        } else {
            res.status(400).json("token is missing");
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.postUser = async(req, res, next) => {
    try {
        const usernameIsUnique = await User.findOne({ username: req.body.username })
        const emailIsUnique = await User.findOne({ email: req.body.email })
        if (usernameIsUnique) {
            res.status(400).json({ error: 'username is used' });
        } else if (emailIsUnique) {
            res.status(400).json({ error: 'email is used' });
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
              });
            const thisUser = await newUser.save();
    
            res.status(200).json(thisUser);
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.patchUser = async(req, res, next) => {
    try {
        if (req.headers["cookie"]) {
            const authHeader = req.headers["cookie"];
            const token = authHeader.split("=")[1];
            const user = jwt.verify(token, SECRET);
            if (user) {
                const thisUser = await User.findOneAndUpdate(
                    { username: user['username'] }, 
                    { $push: { cars: { car_name: req.body.cars }}}, 
                    { new: true }
                );
                const thisCar = await Car.findOneAndUpdate(
                    { name: req.body.cars},
                    { $push: { members: { member_name: user['username'] }}},
                    { new: true }
                )
                res.status(200).json('ok');
            } else {
                res.status(400).json("token is invalid");
            }
        } else {
            res.status(400).json("token is missing");
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

