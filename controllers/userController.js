const User = require('../models/usersModel')
const bcrypt = require("bcrypt");
const crypto = require('crypto')
const sharp = require('sharp')
const auth = require('../controllers/authController')
const s3 = require('../s3');

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

exports.getAllUser = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers.cookie)

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const allUser = await User.find({ username: { $regex: new RegExp(req.params.username, 'i') } });
            let allUserName = []
            let friended = []
            user.friends.forEach(e => {
                friended.push(e._id.toString())
            })
            
            for ( let i = 0; i < allUser.length; i++ ) {
                
                if (allUser[i]._id.toString() == user._id.toString()) {
                    continue
                } else if (friended.includes(allUser[i]._id.toString())) {
                    continue
                } else {
                    const thisUser = { 
                        _id: allUser[i]._id,
                        username: allUser[i].username,
                        profilePicture: await s3.getObjectSignedUrl(allUser[i].profilePicture),
                     }
                    allUserName.push(thisUser)
                }
            }

            res.status(200).json({ ok: true, data: allUserName });
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
                profilePicture: "5bce901229ea2f9f84190b1ed3d2799119a8f2c01433436e37f2bb77af0654c5"
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
        const user = await auth.authUser(req.headers.cookie)

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            let thisUser, response;
            if (req.file) {

                const file = req.file;
                const imageName = generateFileName();

                const fileBuffer = await sharp(file.buffer)
                  .resize({ height: 300, width: 300, fit: "contain" })
                  .toBuffer()

                await s3.uploadFile(fileBuffer, imageName, file.mimetype)

                if (req.body.username) {
                    thisUser = await User.findOneAndUpdate(
                        { _id: user._id }, 
                        { $set: { username: req.body.username, profilePicture: imageName } }, 
                        { new: true }
                    );
                } else {
                    thisUser = await User.findOneAndUpdate(
                        { _id: user._id }, 
                        { $set: { profilePicture: imageName } }, 
                        { new: true }
                    );
                }
                const postedFile = await s3.getObjectSignedUrl(imageName);
                response = { user: thisUser, profilePicture: postedFile }
            } else {
                thisUser = await User.findOneAndUpdate(
                    { _id: user._id }, 
                    { $set: { username: req.body.username } }, 
                    { new: true }
                );
                response = { user: thisUser }
            }
            
            res.status(200).json({ok: true, data: response });
        } 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deleteUser = async(req, res, next) => {
    try {
        const user = await auth.authUser(req.headers.cookie)

        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const thisUser = await User.deleteOne({ _id: user._id });

            res.status(200).json({ ok: true });
        } 
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
