const User = require('../models/usersModel')
const Car = require('../models/carsModel')
const Message = require('../models/messagesModel')
const Chat = require('../models/chatsModel')
const auth = require('./authController')
const { default: mongoose } = require('mongoose')

exports.getChat = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            let allChat = []
            const chatList = await Chat.find({ _id: { $in: user['chats']}});

            chatList.forEach(e => {
                if (e['participants'][0]['_id'] == user['_id']) {
                    allChat.push({ _id: e['_id'], name: e['participants'][1]['name'] })
                } else {
                    allChat.push({ _id: e['_id'], name: e['participants'][0]['name'] })
                }
            });
            // res.status(200).json({ok: true, data: allChat});
            return allChat;
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.getChats = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {

            const chatList = await Chat.aggregate([
                {
                    $match: { _id: { $in: user['chats']}}
                },
                {
                    $unwind: '$participants'
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'participants._id',
                        foreignField: '_id',
                        as: 'participantsInfo'
                    }
                },
                // {
                //     $unwind: '$participantsInfo'
                // },
                {
                    $group: {
                      _id: '$_id',
                      participantsInfo: { $push: '$participantsInfo' }
                    }
                }
            ]).sort({ _id: 1 })
            chatList.forEach(e => {
                // console.log(e['participantsInfo'][0][0]['_id'], user['_id'])
                if (e['participantsInfo'][1][0]['_id'] == user['_id']) {
                    e['participantsInfo'] = e['participantsInfo'][0][0]
                } else {
                    e['participantsInfo'] = e['participantsInfo'][1][0]
                }
            })
            res.status(200).json({ok: true, data: chatList});
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

            // const targetId = mongoose.Types.ObjectId(req.body.target_id)

            const newChat = new Chat({ 
                participants: [
                    { _id: req.body.target_id, name: req.body.target_name }, 
                    { _id: user['_id'], name: user['username'] }
                ]})
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
            // return thisChat
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