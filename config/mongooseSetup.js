
const mongoose = require('mongoose');
const logger = require('./logger');
const {
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_IP,
    MONGO_PORT,
} = require("./index");

module.exports = async () => {
    //TODO: just for test and dev
    let MONGO_URL;
    if (process.env.NODE_ENV === 'dev') {
        MONGO_URL = `mongodb://localhost:27017/testDev`
    } else {
        MONGO_URL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/testDev?authSource=admin`;
    }

    try {
        await mongoose.connect(MONGO_URL);
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
}