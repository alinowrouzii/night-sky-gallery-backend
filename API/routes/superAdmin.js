const express = require('express');
const { verifyToken, isSuperAdmin } = require('./../middleware/auth');
const { fetchAdmins, verifyAdmin } = require('./../controllers/superAdminController');
const router = express.Router();

router.use([verifyToken, isSuperAdmin]);

router.post('/:username', verifyAdmin);
router.get('/', fetchAdmins);

module.exports = router;