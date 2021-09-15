const redis = require("redis");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const { REDIS_PORT, REDIS_URL } = require("../config");

let host;
if (process.env.NODE_ENV === 'dev') {
  host = "127.0.0.1";
} else {
  host = REDIS_URL
}

const redisClient = redis.createClient({
  host,
  port: REDIS_PORT,
  enable_offline_queue: false,
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 1, // 1 requests
  //TODO: update after testing
  duration: 1, // per 1 second by IP
});

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => {
      return next();
    })
    .catch(() => {
      return res.status(429).send("Too Many Requests");
    });
};

module.exports = rateLimiterMiddleware;
