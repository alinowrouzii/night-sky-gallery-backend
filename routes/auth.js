const express = require('express');
const verifyToken = require('../middleware/auth.js');
const { register, login, logout } = require('./../controllers/authController.js')

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout',verifyToken, logout);

module.exports = router;