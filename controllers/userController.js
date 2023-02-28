const User = require('../models/usersModel')
const Car = require('../models/carsModel')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const config = require('../config/config');
const SECRET = config.jwtKey
const auth = require('../controllers/authController')

exports.getAllUser = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const allUser = await User.find({ username: { $regex: new RegExp(req.params.username, 'i') } });
            const allUserName = []
            allUser.forEach(e => { 
                allUserName.push(e['username'])
            })
            res.status(200).json(allUserName);
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

exports.putUser = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const thisUser = await User.findOneAndUpdate(
                { _id: user['_id'] }, 
                { $set: req.body }, 
                { new: true }
            );

            res.status(200).json(thisUser);
        } 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

// exports.patchUser = async(req, res, next) => {
//     try {
//         const user = await auth.authUser(req.headers["cookie"])
//         let thisUser;
//         let targetUser;
//         if (user === 401) {
//             res.status(401).json("Unauthorized");
//         } else {
//             if (req.body.action === 'add') {
//                 targetUser = await User.findById(req.body.target_id)
//                 thisUser = await User.findOneAndUpdate(
//                     { _id: user['_id'] },
//                     { $addToSet: { friends: { _id: targetUser['_id'], name: targetUser['username'] }}},
//                     { new: true }
//                 );
//             } else if (req.body.action === 'remove') {
//                 targetUser
//                 thisUser = await User.findOneAndUpdate(
//                     { _id: user['_id'] },
//                     { $pull: { friends: { _id: thisCar['_id'] }}},
//                     { new: true }
//                 );
//             }

//             res.status(200).json(thisCar);
//         }
//     } catch (err) {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//         }
//         next(err);
//     }
// }

exports.deleteUser = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const thisUser = await User.deleteOne({ _id: user['_id'] });

            res.status(200).json('ok');
        } 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
