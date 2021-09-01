const express = require('express');
const { verifyToken } = require('../middleware/auth.js');
const { register, login, logout, confirmUser, sendConfirmationCode } = require('./../controllers/authController.js')

const router = express.Router();

router.post('/register', register);
router.post('/confirmUser', confirmUser);
router.post('/sendCode', sendConfirmationCode);
router.post('/login', login);
router.get('/logout', verifyToken, logout);

module.exports = router;