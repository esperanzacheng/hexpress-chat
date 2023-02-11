const User = require('../models/usersModel')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const config = require('../config/config');
const SECRET = config.jwtKey

exports.getUser = async(req, res, next) => {
    try {
        if (req.headers["cookie"]) {
            const authHeader = req.headers["cookie"];
            const token = authHeader.split("=")[1];
            const user = jwt.verify(token, SECRET);
            if (user) {
                const resp = { name: user['username'], photo: user['profilePicture'], cars: user['cars']}
                res.status(200).json(resp);
            } else {
                res.status(400).json("token is invalid");
            }
        } else {
            res.status(400).json("token is missing");
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.loginUser = async(req, res, next) => {
    const EXPIRES_IN = 7 * 24 * 60 * 60 * 1000;
    try {
        
        const user = await User.findOne({ email: req.body.email });
        !user && res.status(404).json({ error: "user not found" });

        const validPassword = await bcrypt.compare(req.body.password, user.password)
        !validPassword && res.status(400).json({ error: "wrong password" })

        const token = jwt.sign(user.toJSON(), SECRET, { expiresIn: EXPIRES_IN });
        res.cookie('token', token, { maxAge: EXPIRES_IN, httpOnly: true}); 
        res.status(200).json({ ok: true, cars: user['cars'] });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.logoutUser = async(req, res, next) => {
    const EXPIRES_IN = 0;
    try {
        res.cookie('token', "", { maxAge: EXPIRES_IN, httpOnly: true}); 
            res.status(200).json("ok");
        
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

