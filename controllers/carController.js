const Car = require('../models/carsModel')
const User = require('../models/usersModel')
const auth = require('../controllers/authController');
const Compartment = require('../models/compartmentsModel');
const s3 = require('../s3');

exports.getAllCar = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])
        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const keyword = req.params.car_keyword
            const allCar = await Car.find({ $or: [ { name: { $regex: new RegExp(keyword, 'i') } }, { topic: { $regex: new RegExp(keyword, 'i') }} ] });

            res.status(200).json({ok: true, data: allCar});
        }

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.getCar = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])
        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const allCar = user['cars'];
            res.status(200).json(allCar);
        }

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.getCarMember = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])
        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            let allMember = []
            const thisCar = await Car.findById(req.params.car_id)
            const allResult = await User.find({ _id: { $in: thisCar['members']}});

            for ( let i = 0; i < allResult.length; i++ ) {
                allResult[i]['profilePicture'] = await s3.getObjectSignedUrl(allResult[i]['profilePicture'])
                allMember.push({ _id: allResult[i]['_id'], username: allResult[i]['username'], profilePicture: allResult[i]['profilePicture'] })
            }
            // allResult.forEach(e => {
            //     allMember.push({ _id: e['_id'], username: e['username'], profilePicture: e['profilePicture'] })
            // })

            res.status(200).json({ ok: true, data: allMember});
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
        const user = await auth.authUser(req.headers["cookie"])
        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const newCar = new Car(req.body);
            newCar['members'].push({ _id: user['id'], name: user['username'] })
            newCar['members_count'] = 1
            newCar['owner_id'] = user['id']
            const thisCar = await newCar.save();

            const thisUser = await User.findOneAndUpdate(
                { _id: user['_id'] }, 
                { $push: { cars: { _id: newCar['_id'], name: newCar['name'] }}}, 
                { new: true }
            );

            const textCompartment = new Compartment({
                name: 'general',
                type: true,
                car_id: thisCar['_id'],
                owner_id: user['id']
            })
            const thisTextCompartment = await textCompartment.save();

            const voiceCompartment = new Compartment({
                name: 'general',
                type: false,
                car_id: thisCar['_id'],
                owner_id: user['id']
            })
            const thisVoiceCompartment = await voiceCompartment.save();

            res.status(200).json({ ok: true, data: { car: thisCar, text: thisTextCompartment, voice: thisVoiceCompartment } });
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.putCar = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])
        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const thisCar = await Car.findOneAndUpdate(
                { _id: req.params.car_id }, 
                { $set: req.body }, 
                { new: true }
            );
            res.status(200).json(thisCar);
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
        const user = await auth.authUser(req.headers["cookie"])
        let thisCar;
        let thisUser;
        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            if (req.body.action === 'add') {

                thisCar = await Car.findOneAndUpdate(
                    { _id: req.params.car_id }, 
                    { $addToSet: { members: { _id: user['_id'], name: user['username']} }},
                    // { $inc: {members_count: 1 }}, 
                    { new: true }
                );

                thisUser = await User.findOneAndUpdate(
                    { _id: user['_id'] },
                    { $addToSet: { cars: { _id: thisCar['_id'], name: thisCar['name'] }}},
                    { new: true }
                );
            } else if (req.body.action === 'remove') {

                thisCar = await Car.findOneAndUpdate(
                    { _id: req.params.car_id }, 
                    { $pull: { members: { _id: user['_id'] } }}, 
                    // { $inc: {members_count: -1 }}, 
                    { new: true }
                );

                thisUser = await User.findOneAndUpdate(
                    { _id: user['_id'] },
                    { $pull: { cars: { _id: thisCar['_id'] }}},
                    { new: true }
                );
            }

            res.status(200).json({ ok: true, data: thisCar});
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deleteCar = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const thisCar = await Car.deleteOne({ _id: req.body.car_id });

            res.status(200).json('ok');
        } 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}