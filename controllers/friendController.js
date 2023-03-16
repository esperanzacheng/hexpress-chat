const User = require('../models/usersModel')
const auth = require('../controllers/authController')
const s3 = require('../s3');

exports.getFriend = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])
        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            let formattedResult = []
            const allResult = await User.find({ _id: { $in: user['friends']}})

            for (let i = 0; i < allResult.length; i++) {
                for (let j = 0; j < user['friends'].length; j++) {
                    if ( allResult[i]['_id'].toString() == user['friends'][j]['_id'].toString() ) {
                        let friendship = { }
                        friendship['_id'] = allResult[i]['_id']
                        friendship['username'] = allResult[i]['username']
                        friendship['profilePicture'] = await s3.getObjectSignedUrl(allResult[i]['profilePicture'])
                        friendship['verified'] = user['friends'][j]['verified']
                        friendship['sender'] = user['friends'][j]['sender']
                        formattedResult.push(friendship)
                        break
                    }
                }
            }
            
            res.status(200).json({ok: true, data: formattedResult});
        } 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.postFriendRequest = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])
        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {

            const newFriend = await User.findOneAndUpdate(
                { _id: req.body._id }, 
                { $addToSet: { friends: { _id: user['_id'], verified: 0, sender: 0 } }},
                { new: true }
            );

            const thisUser = await User.findOneAndUpdate(
                { _id: user['_id'] }, 
                { $addToSet: { friends: { _id: req.body._id, verified: 0, sender: 1 } }},
                { new: true }
            );

            res.status(200).json( { ok: true, data: {_id: newFriend['_id'], username: newFriend['username'], profilePicture: newFriend['profilePicture']} });
        } 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.putFriendRequest = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {

            const thisUser = await User.findOneAndUpdate(
                { _id: user['_id'], 'friends._id': req.body._id },
                { $set: { "friends.$.verified": 1 }},
                { new: true }
            );
            const newFriend = await User.findOneAndUpdate(
                { _id: req.body._id, 'friends._id': user['_id'] },
                { $set: { "friends.$.verified": 1 }},
                { new: true }
           );
            res.status(200).json({ ok: true, data: newFriend });
        } 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deleteFriendRequest = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers["cookie"])

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const thisUser = await User.updateOne(
                { _id: user['_id'] },
                { $pull: { friends: { _id: req.body._id } }},
                { new: true }
            );
            const newFriend = await User.updateOne(
                { _id: req.body._id },
                { $pull: { friends: { _id: user['_id'] } }},
                { new: true }
           );

            res.status(200).json({ ok: true });
        } 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
