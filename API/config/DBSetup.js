
const mongoose = require('mongoose');
const logger = require('./logger');
const {
   MONGO_URL
} = require("./index");

module.exports = async () => {
    
    try {
        await mongoose.connect(MONGO_URL);
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
}