const express = require('express');
const multer = require('multer');
const { uploadProductImages } = require('../controllers/upload.controller');
const protect = require('../middlewares/auth.middleware');
const adminOnly = require('../middlewares/admin.middleware');

const router = express.Router();

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post(
  '/product-images',
  protect,
  adminOnly,
  upload.array('images', 5),
  uploadProductImages
);

module.exports = router;
