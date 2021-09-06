const express = require('express');
const { verifyToken, isAdmin } = require('./../middleware/auth');
const { createPost, editPost, editPostPhoto, deleteOnePost, confirmComment, getComments } = require('./../controllers/adminController');

const router = express.Router();

router.use([verifyToken, isAdmin]);

router.post('/', createPost);

router.patch('/:postId', editPost);
router.patch('/editPhoto/:postId', editPostPhoto);
router.delete('/:postId', deleteOnePost);

router.patch('/comment/:commentId', confirmComment);
router.get('/comment', getComments);

module.exports = router;