const express = require('express');
const { createSignup, listSignups, deleteSignup } = require('../controllers/innerCircle.controller');
const protect = require('../middlewares/auth.middleware');
const adminOnly = require('../middlewares/admin.middleware');

const router = express.Router();

// Public endpoint to create signup
router.post('/', createSignup);

// Admin endpoints
router.get('/', protect, adminOnly, listSignups);
router.delete('/:id', protect, adminOnly, deleteSignup);

module.exports = router;
