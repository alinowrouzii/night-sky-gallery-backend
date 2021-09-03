
const mongoose = require('mongoose');
const logger = require('./logger');

module.exports = async () => {
    let MONGOOSE_URL;
    if (process.env.NODE_ENV === 'dev') {
        MONGOOSE_URL = "mongodb://localhost:27017/devTestDB";

        mongoose.connect(MONGOOSE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        }).then(() => {
            logger.info('MongoDB connected for dropping');

            mongoose.connection.db.dropDatabase(() => {
                logger.info('Droping Database!');
            });
        }).catch(error => {
            logger.error(`Faild to connect mongoDB for auth test: ${error}`);
        });

    } else {
        MONGOOSE_URL = process.env.MONGOOSE_URL;
    }

    try {
        await mongoose.connect(MONGOOSE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
}