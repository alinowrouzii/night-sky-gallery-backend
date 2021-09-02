const express = require('express');
const { verifyToken, isAdmin } = require('./../middleware/auth');
const { createPost, editPost, editPostPhoto } = require('./../controllers/postController');

const router = express.Router();

router.use([verifyToken, isAdmin]);

router.post('/', createPost);

router.patch('/edit', editPost);
router.patch('/editPhoto', editPostPhoto);

module.exports = router;