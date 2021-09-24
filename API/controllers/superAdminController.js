const mongoose = require("mongoose");
const User = require("./../models/User.js");
const { userTypes, userStatus } = require("./../models/constants.js");
const logger = require('./../config/logger');
const SuperAdmin = require('./../models/SuperAdmin.js');
const jwt = require("jsonwebtoken");
const { jwtExpirySeconds } = require("./constants.js");
const { TOKEN_KEY } = require("./../config/index.js");

exports.superadminLogin = async (req, res) => {

    const { username, password } = req.body;

    if (!(username && password)) {
        return res.status(400).json({ message: "All input is required" });
    }

    try {
        const user = await SuperAdmin.findOne({ username, }).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        if (user.verifyPassword(password)) {

            const token = jwt.sign({ _id: user._id, username, role: userTypes.SUPER_ADMIN }
                , TOKEN_KEY, {
                algorithm: "HS256",
                expiresIn: jwtExpirySeconds,
            });

            // console.log("token:", token);

            res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 });

            return res.status(200).json({ user: { username: user.username }, message: 'You have been successfully logged in' });
        }
        return res.status(401).json({ message: 'گذرواژه اشتباه میباشد' });
    } catch (err) {
        logger.error(err.msg || err.message || err);
        console.log(err)
        return res.status(500).json({ message: err.msg || err.message || 'Database error!' });
    }
}


exports.verifyAdmin = async (req, res) => {

    const { username } = req.params;

    if (!username) {
        return res.status(400).json({ message: 'username is required!' });
    }

    try {

        const fetchedUser = await User.findOneAndSelectAll({ username, role: userTypes.ADMIN });

        if (!fetchedUser) {
            return res.status(404).json({ message: 'User not found!' });
        }

        if (fetchedUser.status === userStatus.SUPER_ADMIN_PENDING) {

            fetchedUser.status = userStatus.ACCEPTED;
            await fetchedUser.save();
            return res.status(200).json({ message: 'User activated successully!' })
        }
        return res.status(400).json({ message: 'Bad request!' });


    } catch (err) {
        logger.error(err.message || err.msg || err);
        return res.status(500).json({ message: 'Something went wrong with Database!' });
    }

}

exports.fetchAdmins = async (req, res) => {

    const { status } = req.query;

    try {

        if (status === userStatus.ACCEPTED) {

            const users = await User.find({
                status: userStatus.ACCEPTED,
                role: userTypes.ADMIN
            }).select('+status').select('+phoneNumber').lean();
            return res.status(200).json({ users, });
        }
        else if (status === userStatus.SUPER_ADMIN_PENDING) {

            const users = await User.find({
                status: userStatus.SUPER_ADMIN_PENDING,
                role: userTypes.ADMIN
            }).select('+status').select('+phoneNumber').lean();
            return res.status(200).json({ users, });
        }
        else {
            const users = await User.find({
                role: userTypes.ADMIN
            }).select('+status').select('+phoneNumber').lean();
            return res.status(200).json({ users, });
        }
    } catch (err) {
        logger.error(err.message || err.msg || err);
        return res.status(500).json({ message: 'Something went wrong with Database!' });
    }
}