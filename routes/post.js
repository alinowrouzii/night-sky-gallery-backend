const express = require('express');
const verifyToken = require('./../middleware/auth')

const router = express.Router();


router.get('/',verifyToken, (req, res) => {
    // console.log(req.user);
    // console.log('token:',req.cookies.token);
    res.status(200).send('hello');
})

module.exports = router;