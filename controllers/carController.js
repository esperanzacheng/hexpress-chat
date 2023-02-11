const Car = require('../models/carsModel')
const User = require('../models/usersModel')
const jwt = require("jsonwebtoken")
const config = require('../config/config');
const SECRET = config.jwtKey

exports.getAllCar = async(req, res, next) => {
    try {
        if (req.headers["cookie"]) {
            const authHeader = req.headers["cookie"];
            const token = authHeader.split("=")[1];
            const user = jwt.verify(token, SECRET);
            if (user) {
                let thisUser = await User.findOne({ username: user.username })
                condition = []
                thisUser.cars.forEach(element => {
                    condition.push({ name: element['car_name']})
                });
                const allCar = await Car.find({ $or: condition });
                res.status(200).json(allCar);
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

exports.postCar = async(req, res, next) => {
    try {
        if (req.headers["cookie"]) {
            const authHeader = req.headers["cookie"];
            const token = authHeader.split("=")[1];
            const user = jwt.verify(token, SECRET);
            if (user) {
                const newCar = new Car(req.body);
                const thisCar = await newCar.save();
                const thisUser = await User.findOneAndUpdate(
                    { username: user['username'] }, 
                    { $push: { cars: { car_name: req.body.name }}}, 
                    { new: true }
                );
                res.status(200).json(thisCar);
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

exports.patchCar = async(req, res, next) => {
    try {
        if (req.headers["cookie"]) {
            const authHeader = req.headers["cookie"];
            const token = authHeader.split("=")[1];
            const user = jwt.verify(token, SECRET);
            if (user) {
                const thisCar = await Car.findOneAndUpdate(
                    { name: req.body.cars }, 
                    { $push: { compartments: { comp_name: req.body.compartments }}}, 
                    { new: true }
                );
                res.status(200).json({ok: true});
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