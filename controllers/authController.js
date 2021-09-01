const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { userStatus, userTypes } = require('./../models/constants');
const { generatePassword, validatePassword } = require('./../lib/generatePassword')
const { jwtExpirySeconds } = require('./constants');
const randomize = require('randomatic');
const date = require('date-and-time');
const logger = require("../config/logger");

const { TOKEN_KEY } = process.env;

exports.login = async (req, res) => {

    const { username, password } = req.body;

    if (!(username && password)) {
        return res.status(400).send("All input is required");
    }

    try {
        const fetchedUser = await User.findOneAndSelectAll({ username, }).lean();

        if (!fetchedUser) {
            return res.status(404).json({ message: 'User not found!' });
        }

        const { hash, salt, ...user } = fetchedUser;

        if (validatePassword(password, hash, salt)) {

            if (user.status !== userStatus.ACCEPTED) {
                return res.status(403).json({ message: 'User has\'t accepted yet!' })
            }

            const token = jwt.sign({ user_id: user._id, username, role: user.role }
                , TOKEN_KEY, {
                algorithm: "HS256",
                expiresIn: jwtExpirySeconds,
            });

            // console.log("token:", token);

            res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 });

            return res.status(200).json({ user, message: 'You have been successfully logged in' });
        }
        return res.status(401).json({ message: 'Wrong password' });
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


        if (password.length < 8) {
            return res.status(400).json({ message: 'Password should be at least 8 characters!!' });
        }

        //save all phone number by one format
        //Format is: 0922 222 1234
        const phone = '0' + phoneNumber.slice(-10);

        const { salt, hash } = generatePassword(password);

        const newUser = new User({
            firstName, lastName, username, phoneNumber: phone, role, salt, hash,
            status: userStatus.PENDING
        });

        const confirmationCode = randomize('0', 6);

        // user.confirmation.code = confirmationCode;

        const now = new Date();
        //confirmation code expires at 4 minnutes later
        const expireAt = date.addMinutes(now, 4);

        // //TEST : expires after 20 seconds
        // const expireAt = date.addSeconds(now, 20);

        newUser.confirmation = {
            code: confirmationCode,
            //first attempt to get  confirmation code
            attempt: 1,
            expireAt,
        }

        await newUser.save();

        // console.log(user);

        const { salt: saltt, hash: hashh, ...user } = newUser.toObject();

        //TODO: remove after testing. Send confirmation code to user
        return res.status(201).json({ message: 'New user created successfully! Enter ur confirmation code.', code: confirmationCode });
    } catch (err) {
        logger.error(err.message || err.msg || err);
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).end();
        }
        return res.status(500).json({ message: 'Database error!' });
    }
}

exports.confirmUser = async (req, res) => {
    const { username, password, confirmationCode } = req.body;

    if (!(username && password && confirmationCode)) {
        return res.status(400).json({ message: 'All input is required!' });
    }

    try {

        const fetchedUser = await User.findOneAndSelectAll({ username, }).select('+confirmation');

        if (!fetchedUser) {
            return res.status(404).json({ message: 'User not found!' });
        }

        const { salt, hash, ...user } = fetchedUser.toObject();

        if (!validatePassword(password, hash, salt)) {
            return res.status(401).json({ message: 'Wrong password!' });
        }


        if (user.status !== userStatus.PENDING) {
            return res.status(400).json({ message: 'Bad request!' });
        }


        const expireAt = user.confirmation.expireAt;

        if (user.confirmation.code === confirmationCode && (date.subtract(expireAt, new Date()).toMilliseconds() > 0)) {
            let message = '';
            if (user.role === userTypes.SUBSCRIBER) {
                fetchedUser.status = userStatus.ACCEPTED;
                message = 'Your account has been activated! You can login now.';

            } else if (user.role === userTypes.ADMIN) {
                fetchedUser.status = userStatus.SUPER_ADMIN_PENDING;
                message = 'You should be waiting for superAdmin to confirm you';
            }
            await fetchedUser.save();

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

        const fetchedUser = await User.findOneAndSelectAll({ username, }).select('+confirmation');

        if (!fetchedUser) {
            return res.status(404).json({ message: 'User not found!' });
        }


        if (!validatePassword(password, fetchedUser.hash, fetchedUser.salt)) {
            return res.status(401).json({ message: 'Wrong password!' });
        }


        if (fetchedUser.status !== userStatus.PENDING || (fetchedUser.status === userStatus.REJECTED)) {
            return res.status(400).json({ message: 'Bad request!' });
        }

        const expireAt = fetchedUser.confirmation.expireAt;

        if (date.subtract(expireAt, new Date()).toSeconds() > 0) {
            // console.log('seconds', date.subtract(expireAt, new Date()).toSeconds());

            return res.status(400).json({ message: 'Your confirmation code is still valid' });
        } else {

            if (fetchedUser.confirmation.attempt <= 5) {

                const confirmationCode = randomize('0', 6);

                const now = new Date();
                //confirmation code expires at 4 minnutes later
                const expireAtt = date.addMinutes(now, 4);

                const attempt = fetchedUser.confirmation.attempt + 1;

                fetchedUser.confirmation = {
                    code: confirmationCode,
                    attempt: attempt,
                    expireAt: expireAtt
                }

                await fetchedUser.save();

                //TEST: just for test sending confirmation code as response
                return res.status(200).json({ message: 'New confirmation code sent', code: confirmationCode });

            } else {
                fetchedUser.status = userStatus.REJECTED;

                await fetchedUser.save();
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


