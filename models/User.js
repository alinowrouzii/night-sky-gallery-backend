const mongoose = require('mongoose');
const { userTypes, userStatus } = require('./constants');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
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
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        required: true,
        enum: [userTypes.SUBSCRIBER, userTypes.ADMIN, userTypes.SUPER_ADMIN]
    },
    status: {
        type: String,
        required: true,
        enum: [userStatus.PENDING, userStatus.SUPER_ADMIN_PENDING, userStatus.ACCEPTED, userStatus.REJECTED]
    },
    confirmation: {
        type: {
            code: String,
            expireAt: Date,
            attempt: Number,
        },
        select: false
    },
    salt: {
        type: String,
        required: true,
        select: false
    },
    hash: {
        type: String,
        required: true,
        select: false
    },
}, { timestamps: true });


const User = mongoose.model('User', userSchema);

module.exports = User;