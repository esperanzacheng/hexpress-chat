const User = require('../models/usersModel')
const Chat = require('../models/chatsModel')
const auth = require('./authController')
const mongoose = require('mongoose');
const s3 = require('../s3');

exports.getChat = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers.cookie)
        if (user === 401) {
            return 401
        } else {
            let firstChatId;

            if (user['chats'][0]) {
                const firstChat = await Chat.find({ _id: { $in: user.chats[0]}});
                
                if (firstChat == []) {
                    firstChatId = null
                } else {
                    firstChatId = firstChat[0]._id;
                }
            } else {
                firstChatId = null
            }

            return firstChatId;
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.verifyChats = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers.cookie)

        if (user === 401) {
            return 401;
        } else {
            const allChat = []
            user.chats.forEach(e => {
                allChat.push(e._id.toString())
            })

            if (allChat.includes(req.params.chat_id)) {
                return 200;
            } else {
                return { err: 403, chat_id: allChat[0]}
            }
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
            const allChat = []
            user['chats'].forEach(e => {
                allChat.push(e._id)
            })

            const chatList = await Chat.aggregate([
                {
                    $match: { _id: { $in: allChat}}
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
                {
                    $group: {
                      _id: '$_id',
                      participantsInfo: { $push: '$participantsInfo' }
                    }
                }
            ]).sort({ _id: 1 })

            for ( let i = 0; i < chatList.length; i++ ) {
                if (chatList[i].participantsInfo[1][0]._id.toString() == user._id.toString()) {
                    chatList[i].participantsInfo = chatList[i].participantsInfo[0][0]
                } else {
                    chatList[i].participantsInfo = chatList[i].participantsInfo[1][0]
                }
                chatList[i].participantsInfo.profilePicture = await s3.getObjectSignedUrl(chatList[i].participantsInfo.profilePicture)
            }
            
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
        const user = await auth.authUser(req.headers.cookie)
        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {

            const formattedId = mongoose.Types.ObjectId(req.body._id)

            const newChat = new Chat({ 
                participants: [
                    { _id: formattedId, name: req.body.target_name }, 
                    { _id: user._id, name: user.username }
                ]})
            const thisChat = await newChat.save();

            const thisUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $push: { chats: { _id: thisChat._id, participants: formattedId } }},
                { new: true }
            );

            const targetUser = await User.findOneAndUpdate(
                { _id: formattedId },
                { $push: { chats: { _id: thisChat._id, participants: user._id } }},
                { new: true }
            );

            res.status(200).json({ ok: true, data: thisChat});

        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deleteChat = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const thisChat = await Chat.deleteOne({ _id: req.body.chat_id });

            const thisUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $pull: { chats: thisChat._id }},
                { new: true }
            );

            const targetUser = await User.findOneAndUpdate(
                { _id: req.body._id },
                { pull: { chats: thisChat._id }},
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