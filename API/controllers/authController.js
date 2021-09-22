const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { userStatus, userTypes } = require('./../models/constants');
const { jwtExpirySeconds } = require('./constants');
const randomize = require('randomatic');
const date = require('date-and-time');
const logger = require("../config/logger");
const validator = require('validator');
const { TOKEN_KEY } = require("./../config/index.js");

exports.login = async (req, res) => {

    const { username, password } = req.body;

    if (!(username && password)) {
        return res.status(400).send("All input is required");
    }

    try {
        const user = await User.findOneAndSelectAll({ username, });

        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }


        if (user.verifyPassword(password)) {

            if (user.status !== userStatus.ACCEPTED) {
                return res.status(403).json({ message: 'User has\'t accepted yet!' })
            }

            const token = jwt.sign({ _id: user._id, username, role: user.role }
                , TOKEN_KEY, {
                algorithm: "HS256",
                expiresIn: jwtExpirySeconds,
            });

            // console.log("token:", token);

            res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 });

            return res.status(200).json({ user: user.toObj(), message: 'You have been successfully logged in' });
        }

        return res.status(401).json({ message: 'گذرواژه اشتباه میباشد' });
    } catch (err) {
        logger.error(err.msg || err.message || err);

        return res.status(500).json({ message: 'Database error!' });
    }
}
exports.register = async (req, res) => {

    const { firstName, lastName, username, password, phoneNumber, role } = req.body;

    // console.log(firstName, lastName, username, password, phoneNumber)

    if (!(username && password && firstName && lastName && phoneNumber && role)) {
        return res.status(400).json({ message: "All input is required" });
    }

    if (!(role === userTypes.ADMIN || role === userTypes.SUBSCRIBER)) {
        return res.status(400).json({ message: "User type must be ADMIN or SUBSCRIBER" });
    }

    try {

        //we should only know that user is exist with that username or not so call lean on findUser method to
        //just fetch neccesary data and consume much less memory and it returns purly vanilla javascript 
        //It is good to be used when we want to only read the document. NOT writing on document
        const oldUser = await User.findOne({ username, }).lean();

        if (oldUser) {
            return res.status(409).json({ message: "User Already Exist. Please Login" });
        }

        // Validate user input
        const phoneReg = new RegExp('^(0|0098|\\+98)?9(0[1-5]|[1 3 9]\\d|2[0-2]|98)\\d{7}$');
        if (!phoneReg.test(phoneNumber)) {
            return res.status(400).json({ message: 'phone type is not acceptable! it should be like 09221234567' });
        }
        if (validator.isNumeric(password) || validator.isAlpha(password)) {
            return res.status(400).json({ message: 'گذرواژه باید ترکیبی از اعداد و حروف باشد' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'طول گذرواژه حداقل باید 8 باشد' });
        }


        //save all phone number by one format
        //Format is: 0922 222 1234
        const phone = '0' + phoneNumber.slice(-10);


        const newUser = new User({
            firstName, lastName, username, phoneNumber: phone, role,
            status: userStatus.PENDING,
            confirmation: {
                attempt: 0
            }
        });
        newUser.setPassword(password);

        newUser.setConfirmationCode();

        await newUser.save();


        //TODO: modify below line
        const { salt: saltt, hash: hashh, ...user } = newUser.toObject();

        //TODO: remove after testing. Send confirmation code to user
        return res.status(201).json({ message: 'New user created successfully! Enter ur confirmation code.', code: newUser.confirmation.code });
    } catch (err) {
        logger.error(err.message || err.msg || err);
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).end();
        }
        return res.status(500).json({ message: err.message || err.msg });
    }
}

exports.confirmUser = async (req, res) => {
    const { username, password, confirmationCode } = req.body;

    if (!(username && password && confirmationCode)) {
        return res.status(400).json({ message: 'All input is required!' });
    }

    try {

        const user = await User.findOneAndSelectAll({ username, }).select('+confirmation');

        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        if (!user.verifyPassword(password)) {
            return res.status(401).json({ message: 'Wrong password!' });
        }


        if (user.status !== userStatus.PENDING) {
            return res.status(400).json({ message: 'Bad request!' });
        }


        const expireAt = user.confirmation.expireAt;

        if (user.confirmation.code === confirmationCode && (date.subtract(expireAt, new Date()).toMilliseconds() > 0)) {
            let message = '';
            if (user.role === userTypes.SUBSCRIBER) {
                user.status = userStatus.ACCEPTED;
                message = 'Your account has been activated! You can login now.';

            } else if (user.role === userTypes.ADMIN) {

                //TODO: change accepted to pending_super_admin
                //this is just for test
                user.status = userStatus.ACCEPTED;
                // user.status = userStatus.SUPER_ADMIN_PENDING;

                message = 'You should be waiting for superAdmin to confirm you';
            }
            await user.save();

            return res.status(200).json({ message, })
        } else {
            return res.status(400).json({ message: 'code is wrong or maybe is expired!' });
        }
    } catch (err) {
        logger.error(err.msg || err.message || err);
        // console.log(err.message || err.msg || err);
        return res.status(500).json({ message: 'Database error!' })
    }
}



exports.sendConfirmationCode = async (req, res) => {

    const { username, password } = req.body;

    if (!(username && password)) {
        return res.status(400).json({ message: 'All input is required!' });
    }

    try {

        const user = await User.findOneAndSelectAll({ username, }).select('+confirmation');

        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }


        if (!user.verifyPassword(password)) {
            return res.status(401).json({ message: 'Wrong password!' });
        }


        if (user.status !== userStatus.PENDING || (user.status === userStatus.REJECTED)) {
            return res.status(400).json({ message: 'Bad request!' });
        }

        const expireAt = user.confirmation.expireAt;

        //TODO: set 245 just for testing because of expire time of each confimation code(4min=240second)
        //change 245 to zero after testing
        if (date.subtract(expireAt, new Date()).toSeconds() > 245) {
            // console.log('seconds', date.subtract(expireAt, new Date()).toSeconds());

            return res.status(400).json({ message: 'Your confirmation code is still valid' });
        } else {

            if (user.confirmation.attempt <= 5) {

                user.setConfirmationCode();
                await user.save();

                //TEST: just for test sending confirmation code as response
                return res.status(200).json({ message: 'New confirmation code sent', code: user.confirmation.code });

            } else {
                user.status = userStatus.REJECTED;
                await user.save();

                return res.status(403).json({ message: 'Your account has been banned!' });
            }
        }
    } catch (err) {
        logger.error(err.msg || err.message || err);
        // console.log(err.message || err.msg || err);
        return res.status(500).json({ message: 'Database error!' })
    }

}


exports.logout = async (req, res) => {
    res.cookie("token", undefined, { maxAge: 0 });

    return res.status(200).json({ message: 'logout successfully' });
}


