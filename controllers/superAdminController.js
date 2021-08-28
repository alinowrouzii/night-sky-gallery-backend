const mongoose = require("mongoose");
const User = require("./../models/User.js");
const { userTypes, userStatus } = require("./../models/constants.js");

// exports.login = async (req, res) => {

//     const { password } = req.body;

//     if (!password) {
//         return res.status(400).send("password is required");
//     }

//     try {
//         const fetchedUser = await User.findOne({
//             username: userTypes.SUPER_ADMIN.toLowerCase()
//         }).select('+salt').select('+hash').lean();

//         if (!fetchedUser) {
//             return res.status(400).json({ message: 'User not found!' });
//         }
//         const { hash, salt, ...user } = fetchedUser;

//         if (user.role === userTypes.SUPER_ADMIN) {

//             if (validatePassword(password, hash, salt)) {

//                 const token = jwt.sign({ user_id: user._id, username, role: user.role }
//                     , TOKEN_KEY, {
//                     algorithm: "HS256",
//                     expiresIn: jwtExpirySeconds,
//                 });

//                 res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 });

//                 return res.status(200).json({ user, message: 'You have been successfully logged in as superUser' });
//             }
//             return res.status(401).json({ message: 'Wrong password' });
//         } else {
//             return res.status(401).json({ message: 'Only super admin can get access!' });
//         }
//     } catch (err) {
//         console.log(err);
//         return res.status(502).json({ message: 'Database error!' });
//     }
// }

exports.acceptAdmin = async (req, res) => {

    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'username and password are required!' });
    }


    try {
        const Id = await mongoose.Types.ObjectId(userId);

        const fetchedUser = await User.findById(Id);

        if (!fetchedUser) {
            return res.status(404).json({ message: 'User not found!' });
        }

        if (fetchedUser.status === userStatus.SUPER_ADMIN_PENDING) {
            fetchedUser.status = userStatus.ACCEPTED;
            await fetchedUser.save();
            return res.status()
        }




    } catch (err) {
        console.log(err.message || err.msg || err);
        return res.status(503).json({ message: 'Something went wrong with Database!' });
    }

}