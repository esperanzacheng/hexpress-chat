const User = require('../models/usersModel')
const Car = require('../models/carsModel')
const Message = require('../models/messagesModel')
const Chat = require('../models/chatsModel')
const auth = require('./authController')

exports.getChat = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const allChat = user['chats'];
            res.status(200).json(allChat);
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.postChat = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])
        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {

            const newChat = new Chat({ participants: [{ _id: req.body.target_id }, { _id: user['_id'] }] })
            const thisChat = await newChat.save();

            const thisUser = await User.findOneAndUpdate(
                { _id: user['_id'] },
                { $push: { chats: thisChat['_id'] }},
                { new: true }
            );

            const targetUser = await User.findOneAndUpdate(
                { _id: req.body.target_id },
                { $push: { chats: thisChat['_id'] }},
                { new: true }
            );

            res.status(200).json(thisChat);
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

// exports.putChat = async(req, res, next) => {
//     try {
//         const user = await auth.authUser(req.headers["cookie"])

//         if (user === 401) {
//             res.status(401).json("Unauthorized");
//         } else {
//             const thisChat = await Chat.findOneAndUpdate(
//                 { _id: req.params.chat_id }, 
//                 { $set: req.body }, 
//                 { new: true }
//             );

//             res.status(200).json(thisChat);
//         } 
//     } catch (err) {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//         }
//         next(err);
//     }
// }

exports.deleteChat = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const thisChat = await Chat.deleteOne({ _id: req.body.chat_id });

            const thisUser = await User.findOneAndUpdate(
                { _id: user['_id'] },
                { $pull: { chats: thisChat['_id'] }},
                { new: true }
            );

            const targetUser = await User.findOneAndUpdate(
                { _id: req.body.target_id },
                { pull: { chats: thisChat['_id'] }},
                { new: true }
            );

            res.status(200).json('ok');
        } 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}