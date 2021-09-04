const mongoose = require("mongoose");
const User = require("./../models/User.js");
const { userTypes, userStatus } = require("./../models/constants.js");
const logger = require('./../config/logger');

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