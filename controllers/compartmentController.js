const User = require('../models/usersModel')
const Car = require('../models/carsModel')
const Message = require('../models/messagesModel')
const Compartment = require('../models/compartmentsModel')
const auth = require('./authController')

exports.getCompartment = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const allCompartment = await Compartment.find(req.params);
            res.status(200).json({ ok: true, data: allCompartment});
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.getFirstCompartment = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])
        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const car = req.params.car
            const firstCar = await Compartment.findOne({ car_id: car })
            const carWithCompartment = { car: car, compartment: firstCar['_id'] }
            return carWithCompartment;
        }

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.postCompartment = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])
        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const newCompartment = new Compartment(req.body)
            newCompartment['owner_id'] = user['_id']
            newCompartment['message_count'] = 0
            const thisCompartment = await newCompartment.save();
            
            res.status(200).json(thisCompartment);
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.putCompartment = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const thisCompartment = await Compartment.findOneAndUpdate(
                { _id: req.params.compartment_id }, 
                { $set: req.body }, 
                { new: true }
            );

            res.status(200).json(thisCompartment);
        } 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deleteCompartment = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const thisCompartment = await Compartment.deleteOne({ _id: req.body.compartment_id });

            res.status(200).json('ok');
        } 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}