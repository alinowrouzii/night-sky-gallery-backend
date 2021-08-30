

//mongoDB connection setup
const logger = require('./config/logger.js');
const mongooseSetup = require('./config/mongooseSetup.js');
const app = require('./app');


mongooseSetup().then(() => {
    logger.info('MongoDB connected!!');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => logger.info(`Server is running on Port: ${PORT}`));

}).catch(err => {
    logger.error(`${err} mongoDB didn't connect!`);
    process.exit(1)
});
