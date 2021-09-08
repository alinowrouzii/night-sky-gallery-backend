
const mongoose = require('mongoose');
const logger = require('./logger');
const {
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_IP,
    MONGO_PORT,
  } = require("./index");

module.exports = async () => {
    const MONGOOSE_URL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/testDev/?authSource=admin`;

    // if (process.env.NODE_ENV === 'development') {
    //     MONGOOSE_URL = "mongodb://localhost:27017/devTestDB";

    //     // mongoose.connect(MONGOOSE_URL, {
    //     //     useNewUrlParser: true,
    //     //     useUnifiedTopology: true,
    //     //     useCreateIndex: true,
    //     //     useFindAndModify: false
    //     // }).then(() => {
    //     //     logger.info('MongoDB connected for dropping');

    //     //     mongoose.connection.db.dropDatabase(() => {
    //     //         logger.info('Droping Database!');
    //     //     });
    //     // }).catch(error => {
    //     //     logger.error(`Faild to connect mongoDB for auth test: ${error}`);
    //     // });

    // } else {
    //     MONGOOSE_URL = process.env.MONGOOSE_URL;
    // }

    try {
        await mongoose.connect(MONGOOSE_URL);
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
}