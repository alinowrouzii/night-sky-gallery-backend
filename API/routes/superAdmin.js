const express = require('express');
const { verifyToken, isSuperAdmin } = require('./../middleware/auth');
const { fetchAdmins, verifyAdmin, superadminLogin } = require('./../controllers/superAdminController');
const router = express.Router();


router.post('/:username', [verifyToken, isSuperAdmin], verifyAdmin);
router.get('/', [verifyToken, isSuperAdmin], fetchAdmins);
router.post('/', superadminLogin);

module.exports = router;