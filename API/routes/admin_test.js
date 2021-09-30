const AdminBro = require('admin-bro');
const AdminBroExpress = require('@admin-bro/express');
const AdminBroMongoose = require('@admin-bro/mongoose')
const express = require('express');

const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { verifyToken, isAdmin } = require('../middleware/auth');

let router = express.Router();

// router.use([verifyToken, isAdmin]);

AdminBro.registerAdapter(AdminBroMongoose);

const options = {
    databases: [],
    rootPath: '/admin',
    resources: [Post, User, Comment],
}

const adminBro = new AdminBro(options);



const ADMIN = {
    username: 'test@example.com',
    password: 'password',
}
router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
    authenticate: async (username, password) => {
        if (ADMIN.password === password && ADMIN.username === username) {
            return ADMIN
        }
        return false
    },
    cookieName: 'adminbro',
    cookiePassword: 'somePassword',
    
})
console.log('no')
// router = AdminBroExpress.buildRouter(adminBro, router);

module.exports = {
    router,
    options,
};
