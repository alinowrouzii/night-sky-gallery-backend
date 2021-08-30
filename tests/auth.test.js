const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../config/logger');
const users = require('./Data/users');
const supertest = require('supertest');


// jest.useFakeTimers();

beforeAll((done) => {

  const MONGOOSE_URL = "mongodb://localhost:27017/testDB";

  mongoose.connect(MONGOOSE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  }).then(() => {
    logger.info('MongoDB connected for testing');
    done();
  }).catch(error => {
    logger.error(`Faild to connect mongoDB for test: ${error}`);
    process.exit(1);
  });
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => {
      logger.info('Droping Database!');
      done()
    })
  });

  // mongoose.connection.close(() => {
  //   logger.info('Closing Database!');
  //   done()
  // })
});

test("POST register /auth/register && confirmUser /auth/confirmUser", async () => {
  const user = users[0];
  // const createdUser = await User.create(user);

  await supertest(app).post("/auth/register")
    .send(user)
    .expect(201)
    .then(async (response) => {
      // Check type and length

      // // Check data
      await supertest(app).post('/auth/confirmUser')
        .send({
          username: user.username,
          password: user.password,
          confirmationCode: response.body.code
        })
        .expect(200);
    });
});