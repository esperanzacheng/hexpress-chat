const User = require('../models/usersModel')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const config = require('../config/config');
const SECRET = config.jwtKey

exports.getUser = async(req, res, next) => {
    try {
        const user = await authUser(req.headers["cookie"])
        if (user === 401) {
            res.status(401).json("Unauthorized");
        } else {
            const resp = { name: user['username'], photo: user['profilePicture'], cars: user['cars']}
            res.status(200).json(resp);
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

        const userId = { _id: user['_id'] }
        const token = jwt.sign(userId, SECRET, { expiresIn: EXPIRES_IN });
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

exports.authUser = async(cookie) => {
    if (cookie) {
        const authHeader = cookie;
        const token = authHeader.split("=")[1];
        const userId = jwt.verify(token, SECRET);
        const user = await User.findById(userId)
        if (user) {
            return user
        } else {
            return 401;
        }
    } else {
        return 401;
    }
}

async function authUser(cookie) {
    if (cookie) {
        const authHeader = cookie;
        const token = authHeader.split("=")[1];
        const userId = jwt.verify(token, SECRET);
        const user = await User.findById(userId)
        if (user) {
            return user
        } else {
            return 401;
        }
    } else {
        return 401;
    }
}
