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
        select: false
    },
    role: {
        type: String,
        required: true,
        enum: [userTypes.SUBSCRIBER, userTypes.ADMIN, userTypes.SUPER_ADMIN],
        select: false
    },
    status: {
        type: String,
        required: true,
        enum: [userStatus.PENDING, userStatus.SUPER_ADMIN_PENDING, userStatus.ACCEPTED, userStatus.REJECTED],
        select: false
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


//Selects all fields except confirmation
userSchema.statics.findOneAndSelectAll = function (user) {
    return this.findOne(user).select('+hash').select('+salt').select('+status').select('+role').select('+phoneNumber');
}

const User = mongoose.model('User', userSchema);

module.exports = User;