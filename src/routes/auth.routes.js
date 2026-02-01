const express = require('express');
const { loginAdmin, logoutAdmin, getMe } = require('../controllers/auth.controller');
const protect = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { loginSchema } = require('../validations/auth.schema');

const router = express.Router();

router.post('/login', validate(loginSchema), loginAdmin);
router.post('/logout', protect, logoutAdmin);
router.get('/me', protect, getMe);

module.exports = router;
