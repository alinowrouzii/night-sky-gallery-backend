const express = require('express');
const { verifyToken, isAdmin } = require('./../middleware/auth');
const { createPost } = require('./../controllers/postController');

const router = express.Router();

router.use([verifyToken, isAdmin]);

router.post('/', createPost);


module.exports = router;