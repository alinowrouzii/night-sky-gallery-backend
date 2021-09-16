const app = require('../app');
const mongoose = require('mongoose');
const logger = require('../config/logger');
const supertest = require('supertest');
const users = require('./Data/users');


// jest.useFakeTimers();

beforeAll((done) => {

  const MONGOOSE_URL = "mongodb://localhost:27017/authTestDB";

  mongoose.connect(MONGOOSE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  }).then(() => {
    logger.info('MongoDB connected for auth testing');
    done();
  }).catch(error => {
    logger.error(`Faild to connect mongoDB for auth test: ${error}`);
    process.exit(1);
  });
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => {
      logger.info('Droping auth Database!');
      done()
    })
  });

  // mongoose.connection.close(() => {
  //   logger.info('Closing Database!');
  //   done()
  // })
});

let Cookies;

test("POST register /auth/register && confirmUser /auth/confirmUser", async () => {
  const user = users[0];
  // const createdUser = await User.create(user);

  await supertest(app).post("/auth/register")
    .send(user)
    .expect(201)
    .then(async (response) => {
      // Check type and length

      //5 attempts to send code
      for (var i = 0; i < 5; i++) {
        await supertest(app).post('/auth/sendCode')
          .send({
            username: user.username,
            password: user.password,
          })
          .expect(200).then(async (res) => {
            logger.info('confirmation code ' + res.body.code)
            //5th attempt
            if (i === 4) {
              await supertest(app).post('/auth/confirmUser')
                .send({
                  username: user.username,
                  password: user.password,
                  confirmationCode: res.body.code
                })
                .expect(200);
            }
          })
      }
    });
});



test("POST login /auth/login", async () => {
  const user = users[0];
  // const createdUser = await User.create(user);

  await supertest(app).post("/auth/login")
    .send({
      username: user.username,
      password: user.password
    })
    .expect(200)
    .then(async (response) => {
      Cookies = response.headers['set-cookie'].pop().split(';')[0];
    })
})
