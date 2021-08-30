const mongoose = require("mongoose");
const User = require("./../models/User.js");
const { userTypes, userStatus } = require("./../models/constants.js");
const logger = require('./../config/logger');

exports.verifyAdmin = async (req, res) => {

    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: 'username is required!' });
    }

    try {

        const fetchedUser = await User.findOne({ username, role: userTypes.ADMIN });

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
        return res.status(503).json({ message: 'Something went wrong with Database!' });
    }

}

exports.fetchAdmins = async (req, res) => {

    const { filter } = req.body;

    try {

        if (filter === userStatus.ACCEPTED) {

            const users = await User.find({
                status: userStatus.ACCEPTED,
                role: userTypes.ADMIN
            });
            return res.status(200).json({ users, });
        }
        else if (filter === userStatus.SUPER_ADMIN_PENDING) {

            const users = await User.find({
                status: userStatus.SUPER_ADMIN_PENDING,
                role: userTypes.ADMIN
            });
            return res.status(200).json({ users, });
        }
        else {
            const users = await User.find({
                role: userTypes.ADMIN
            });
            return res.status(200).json({ users, });
        }
    } catch (err) {
        logger.error(err.message || err.msg || err);
        return res.status(503).json({ message: 'Something went wrong with Database!' });
    }
}