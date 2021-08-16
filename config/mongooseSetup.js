
const mongoose = require('mongoose');

module.exports = async () => {
    const MONGIOSE_URL = process.env.MONGOOSE_URL;

    try {
        await mongoose.connect(MONGIOSE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });

        console.log('MongoDB connected!!');
    } catch (error) {
        console.log(`${error} mongoDB didn't connect!`);
    }
}