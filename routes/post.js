const express = require('express');
const { verifyToken, isAdmin } = require('./../middleware/auth')
const { createPost, getPost } = require('./../controllers/postController')
const router = express.Router();

// router.use(verifyToken);

router.get('/test', isAdmin, (req, res) => {
    // console.log(req.user);
    // console.log('token:',req.cookies.token);
    res.status(200).send('hello');
});

router.post('/createPost', createPost);
// router.post('/createPost', isAdmin, createPost);
router.get('/getPost', getPost);

module.exports = router;