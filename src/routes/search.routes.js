const express = require('express');
const { searchProducts, searchSuggestions } = require('../controllers/search.controller');

const router = express.Router();

router.get('/', searchProducts);
router.get('/suggestions', searchSuggestions);

module.exports = router;
