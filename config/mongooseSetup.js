
const mongoose = require('mongoose');
const logger = require('./logger');

module.exports = async () => {
    const MONGIOSE_URL = process.env.MONGOOSE_URL;

    try {
        await mongoose.connect(MONGIOSE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });

        logger.info('MongoDB connected!!');
    } catch (error) {

        logger.error(`${error} mongoDB didn't connect!`);
    }
}