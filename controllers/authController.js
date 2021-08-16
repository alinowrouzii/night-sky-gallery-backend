const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { UserTypes } = require('./../models/constants');
const { generatePassword, validatePassword } = require('./../lib/generatePassword')
const jwtExpirySeconds = 300;
const TOKEN_KEY = process.env.TOKEN_KEY;
exports.login = async (req, res) => {

    const { username, password } = req.body;

    if (!(username && password)) {
        return res.status(400).send("All input is required");
    }

    try {
        const { hash, salt, ...user } = await User.findOne({ username, }).select('+salt').select('+hash').lean();

        if (!user) {
            return res.status(400).json({ message: 'User not found!' });
        }

        if (validatePassword(password, hash, salt)) {

            const token = jwt.sign({ user_id: user._id, username }
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
        console.log(err);
        return res.status(502).json({ message: 'Database error!' });

    }
}
exports.register = async (req, res) => {

    console.log('hello');
    const { firstName, lastName, username, password, phoneNumber } = req.body;

    // console.log(firstName, lastName, username, password, phoneNumber)

    // Validate user input
    if (!(username && password && firstName && lastName && phoneNumber)) {
        return res.status(400).send("All input is required");
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password should be at least 8 characters!!' });
    }

    try {
        const { salt, hash } = generatePassword(password);

        const oldUser = await User.findOne({ username, }).lean();

        if (oldUser) {
            return res.status(409).json({ message: "User Already Exist. Please Login" });
        }

        const user = new User({
            firstName, lastName, username, phoneNumber, role: UserTypes.SUBSCRIBER, salt, hash

        });

        await user.save();

        // console.log(user);

        const token = jwt.sign({ user_id: user._id, username }
            , TOKEN_KEY, {
            algorithm: "HS256",
            expiresIn: jwtExpirySeconds,
        });

        res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 });

        const { salt: saltt, hash: hashh, ...userr } = user.toObject();
        return res.status(201).json({ user: userr, message: 'New user created successfully!' });
    } catch (err) {
        console.log(err);
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).end();
        }
        return res.status(502).json({ message: 'Database error!' });
    }
}

exports.logout = async (req, res) => {
    console.log('try to logout');
    res.cookie("token", undefined, { maxAge: 0 });

    return res.status(200).json({ message: 'logout successfully' });
}