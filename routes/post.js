const express = require('express');
const { verifyToken } = require('./../middleware/auth')
const { getPosts, downloadPhoto, addCommentToPost } = require('./../controllers/postController')
const router = express.Router();

//TODO: check that unauthorized users can see the posts or not
// router.use(verifyToken);

router.get('/', getPosts);
router.get('/donwloadPhoto/:photoName', downloadPhoto);

router.post('/comment/:postId', verifyToken, addCommentToPost);


module.exports = router;