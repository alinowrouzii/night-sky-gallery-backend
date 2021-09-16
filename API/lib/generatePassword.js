const crypto = require('crypto');

exports.generatePassword = (password) => {
    const salt = crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 128, `sha512`).toString(`hex`);

    return { salt, hash };
}

exports.validatePassword = (password, hash, salt) => {
    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 128, `sha512`).toString(`hex`);
    return hashVerify === hash;
}
