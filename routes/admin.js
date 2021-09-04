const express = require('express');
const { verifyToken, isAdmin } = require('./../middleware/auth');
const { createPost, editPost, editPostPhoto } = require('./../controllers/postController');

const router = express.Router();

router.use([verifyToken, isAdmin]);

router.post('/', createPost);

router.patch('/', editPost);
router.patch('/editPhoto/:postId', editPostPhoto);

module.exports = router;