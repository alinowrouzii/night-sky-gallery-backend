const mongoose = require('mongoose');
const { validatePassword, generatePassword } = require('../lib/generatePassword');
const { userTypes, userStatus } = require('./constants');
const randomize = require('randomatic');
const date = require('date-and-time');
const logger = require('../config/logger');

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
    password: {
        type: {
            salt: String,
            hash: String
        },
        select: false
    }
}, { timestamps: true });


//Selects all fields except confirmation
userSchema.statics.findOneAndSelectAll = function (user) {
    return this.findOne(user).select('+password').select('+status').select('+role').select('+phoneNumber');
}

userSchema.methods.verifyPassword = function (password) {

    const user = this;
    if (validatePassword(password, user.password.hash, user.password.salt)) {
        return true;
    }
    return false;
}

userSchema.methods.setPassword = function (password) {

    const user = this;
    const { hash, salt } = generatePassword(password);

    user.password = {
        hash, salt
    }
}
userSchema.methods.setConfirmationCode = function () {

    const user = this;

    const confirmationCode = randomize('0', 6);
    const now = new Date();
    //confirmation code expires at 4 minnutes later
    const expireAt = date.addMinutes(now, 4);

    user.confirmation = {
        code: confirmationCode,
        attempt: user.confirmation ? (user.confirmation.attempt + 1) : 4,
        expireAt,
    }
}

userSchema.methods.toObj = function () {

    const user = this;
    const obj = user.toObject();

    delete obj.password;
    delete obj.status;
    delete obj.role;
    delete obj.confirmation;

    return obj;

}

const User = mongoose.model('User', userSchema);

module.exports = User;