require('dotenv').config()

const { NODE_ENV } = process.env;
let MONGO_URL;

if (NODE_ENV === 'dev') {
  MONGO_URL = `mongodb://localhost:27017/testDev`

} else if (NODE_ENV === 'production' || NODE_ENV === 'development') {
  const MONGO_IP = process.env.MONGO_IP || "mongo",
    MONGO_PORT = process.env.MONGO_PORT || 27017,
    MONGO_USER = process.env.MONGO_USER,
    MONGO_PASSWORD = process.env.MONGO_PASSWORD;

  MONGO_URL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/testDev?authSource=admin`;
} else {
  throw new Error('NODE_ENV should be set!');
}

module.exports = {
  MONGO_URL,
  REDIS_URL: process.env.REDIS_URL || "redis",
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  TOKEN_KEY: process.env.TOKEN_KEY
};