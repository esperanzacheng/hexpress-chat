const User = require('../models/usersModel')
const Car = require('../models/carsModel')
const Chat = require('../models/chatsModel')
const Message = require('../models/messagesModel')
const Compartment = require('../models/compartmentsModel')
const auth = require('../controllers/authController')

exports.getChatMessage = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const page = Number(req.params.page)
            let allChatMessage = await Message.find({ chat_id: req.params.chat_id }).sort({ _id: -1 }).skip( page * 10 ).limit( 11 );
            let nextPage = page + 1

            if ( allChatMessage[10] === undefined ) {
                nextPage = null
            } else {
                allChatMessage = allChatMessage.pop()
            }
            
            res.status(200).json({ ok: true, data: allChatMessage, nextPage: nextPage });
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.postChatMessage = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])
        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const newMessage = new Message(req.body)
            newMessage['author'] = user['_id']

            const thisMessage = await newMessage.save();

            const thisChat = await Chat.findOneAndUpdate(
                { _id: req.body.chat_id }, 
                { $inc: { message_count: 1 }}, 
                { new: true }
            );

            res.status(200).json({ok: true});

        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.putChatMessage = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const thisMessage = await Message.findOneAndUpdate(
                { _id: req.params.message_id }, 
                { $set: req.body }, 
                { new: true }
            );

            res.status(200).json(thisMessage);
        } 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deleteChatMessage = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const thisMessage = await Message.deleteOne({ _id: req.body.message_id });

            res.status(200).json('ok');
        } 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}


exports.getCompartmentMessage = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const allCompartmentMessage = await Message.find({ compartment_id: req.params.compartment_id }).sort({ _id: -1 }).skip( page * 10 ).limit( 11 );
            let nextPage = page + 1
            if ( allCompartmentMessage[10] === undefined ) {
                nextPage = null
            }
            res.status(200).json({ data: allCompartmentMessage, nextPage: nextPage });
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.postCompartmentMessage = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])
        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const newMessage = new Message(req.body)
            newMessage['author'] = user['_id']

            const thisMessage = await newMessage.save();

            const thisCompartment = await Compartment.findOneAndUpdate(
                { _id: req.body.compartment_id }, 
                { $inc: { message_count: 1 }}, 
                { new: true }
            );

            res.status(200).json(thisMessage);

        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.putCompartmentMessage = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const thisMessage = await Message.findOneAndUpdate(
                { _id: req.params.message_id }, 
                { $set: req.body }, 
                { new: true }
            );

            res.status(200).json(thisMessage);
        } 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deleteCompartmentMessage = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const thisMessage = await Message.deleteOne({ _id: req.body.message_id });

            res.status(200).json('ok');
        } 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}