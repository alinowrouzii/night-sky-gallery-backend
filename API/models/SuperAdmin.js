const mongoose = require('mongoose');
const { validatePassword, generatePassword } = require('../lib/generatePassword');

const superadminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: {
            salt: String,
            hash: String
        },
        select: false
    }
}, { timestamps: true });


superadminSchema.methods.setPassword = function (password) {

    const user = this;
    const { hash, salt } = generatePassword(password);

    user.password = {
        hash, salt
    }
}


superadminSchema.methods.verifyPassword = function (password) {

    const user = this;
    if (validatePassword(password, user.password.hash, user.password.salt)) {
        return true;
    }
    return false;
}


const Superadmin = mongoose.model('Superadmin', superadminSchema);

module.exports = Superadmin;