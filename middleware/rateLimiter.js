
const { RateLimiterMongo } = require('rate-limiter-flexible');

module.exports = (mongoConn) => {

    const rateLimiterMongo = new RateLimiterMongo({
        storeClient: mongoConn,
        points: 1, // Number of points
        duration: 1, // Per second
    });

    // const rateLimiterMiddleware = (req, res, next) => {
    return (req, res, next) => {
        rateLimiterMongo.consume(req.ip)
            .then(() => {
                next();
            })
            .catch(_ => {
                res.status(429).send('Too Many Requests');
            });
    };

}
// module.exports = rateLimiterMiddleware;