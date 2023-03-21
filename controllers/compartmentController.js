const Compartment = require('../models/compartmentsModel')
const auth = require('./authController')

exports.getCompartment = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers.cookie)

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
        const user = await auth.authUser(req.headers.cookie)
        if (user === 401) {
            return 401
        } else {
            const car = req.params.car
            let thisUserCars = []
            user.cars.forEach(e => {
                thisUserCars.push(e._id.toString())
            })
            if (thisUserCars.includes(car)) {
                const firstCar = await Compartment.findOne({ car_id: car })
                const carWithCompartment = { car: car, compartment: firstCar._id }
                return carWithCompartment;

            } else if (thisUserCars.length === 0) {
                return { err: 403, data: null }
            } else {
                const firstCar = await Compartment.findOne({ car_id: thisUserCars[0] })
                const carWithCompartment = { car: thisUserCars[0], compartment: firstCar._id }
                return { err: 403, data: carWithCompartment }
            }
        }

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.getCompartmentType = async(req, res) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])
        if (user === 401) {
            return 401
        } else {
            const car = req.params.car
            let thisUserCars = []
            user.cars.forEach(e => {
                thisUserCars.push(e._id.toString())
            })
            if (thisUserCars.includes(car)) {
                const compartment = req.params.compartment
                const allCompartment = await Compartment.find({ car_id: req.params.car })
                let allCompartmentId = []
                allCompartment.forEach(e => {
                    allCompartmentId.push(e._id.toString())
                })
                if (compartment === undefined || !allCompartmentId.includes(compartment)) {
                    const firstCompartment = await Compartment.findOne({ car_id: req.params.car })
                    return { ok: false, _id: firstCompartment._id }
                } else {
                    const thisCompartment = await Compartment.findOne({ _id: compartment })
                    const type = thisCompartment.type
                    return { ok: true, data: type };
                }
            } else {
                return null
            }
        }

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
    }
}

exports.postCompartment = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers.cookie)
        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const newCompartment = new Compartment(req.body)
            newCompartment.owner_id = user._id
            newCompartment.message_count = 0
            const thisCompartment = await newCompartment.save();
            
            res.status(200).json({ ok: true, data: thisCompartment});
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
        const user = await auth.authUser(req.headers.cookie)

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
        const user = await auth.authUser(req.headers.cookie)

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