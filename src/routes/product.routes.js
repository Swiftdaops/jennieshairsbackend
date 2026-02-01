const express = require('express');
const {
  createProduct,
  getAllProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getBestSellers,
  getDiscountedProducts,
  getProductSuggestions,
  updateStock,
  updateFrequentlyBought,
} = require('../controllers/product.controller');
const protect = require('../middlewares/auth.middleware');
const adminOnly = require('../middlewares/admin.middleware');

const router = express.Router();

// Public
router.get('/', getAllProducts);
router.get('/best-sellers', getBestSellers);
router.get('/discounts', getDiscountedProducts);
router.get('/:slug', getProductBySlug);
router.get('/:id/suggestions', getProductSuggestions);

// Admin
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.put('/:id/stock', protect, adminOnly, updateStock);
router.put('/:id/frequently-bought', protect, adminOnly, updateFrequentlyBought);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
