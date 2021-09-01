const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../config/logger');
const supertest = require('supertest');
const users = require('./Data/users');
const posts = require('./Data/posts');

beforeAll((done) => {

    const MONGOOSE_URL = "mongodb://localhost:27017/testDB";

    mongoose.connect(MONGOOSE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(() => {
        logger.info('MongoDB connected for post testing');
        done();
    }).catch(error => {
        logger.error(`Faild to connect mongoDB for post test: ${error}`);
        process.exit(1);
    });
});

afterAll((done) => {
    // mongoose.connection.db.dropDatabase(() => {
    //     mongoose.connection.close(() => {
    //         logger.info('Droping Database!');
    //         done()
    //     })
    // });

    mongoose.connection.close(() => {
        logger.info('Closing post Database!');
        done()
    })
});

let Cookies;

// test("POST register /auth/register && confirmUser /auth/confirmUser", async () => {
//     const user = users[0];
//     // const createdUser = await User.create(user);

//     await supertest(app).post("/auth/register")
//         .send(user)
//         .expect(201)
//         .then(async (response) => {
//             // Check type and length

//             // // Check data
//             await supertest(app).post('/auth/confirmUser')
//                 .send({
//                     username: user.username,
//                     password: user.password,
//                     confirmationCode: response.body.code
//                 })
//                 .expect(200);
//         });
// });



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


test("POST createPost /admin", async () => {
    const post = posts[0];

    const request = supertest(app).post("/admin/");

    request.cookies = Cookies;
    await request
        .attach('photo', 'tests/Data/files/image_1.jpg')
        .field('caption', post.caption)
        .field('title', post.title)
        .expect(201);
    // .send(post)
})


test("GET getPosts /post && downloadPhoto /posts/downloadPhoto/:photoName", async () => {
    // const createdUser = await User.create(user);

    const request = supertest(app).get("/post");

    request.cookies = Cookies;
    await request.expect(200).then(async (res) => {
        const photoName = res.body.posts[0].photo;
        await supertest(app).get("/post/donwloadPhoto/" + photoName)
            .expect(200);
    })
})

