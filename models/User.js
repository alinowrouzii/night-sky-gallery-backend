const mongoose = require('mongoose');
const { UserTypes } = require('./constants');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: Number
    },
    role: {
        type: String,
        enum: [UserTypes.ADMIN, UserTypes.SUBSCRIBER],
        required: true
    },
    salt: {
        type: String,
        select: false
    },
    hash: {
        type: String,
        select: false
    },
    token: {
        type: String
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;