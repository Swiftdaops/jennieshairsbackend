const Product = require('../models/Product');
const Category = require('../models/Category');

exports.searchProducts = async (req, res) => {
  const q = req.query.q || '';
  const products = await Product.find({ $text: { $search: q } });
  res.json(products);
};

exports.searchSuggestions = async (req, res) => {
  const q = req.query.q || '';
  const products = await Product.find({ name: new RegExp(q, 'i') }).limit(5);
  const categories = await Category.find({ name: new RegExp(q, 'i') }).limit(5);
  res.json({ products: products.map((p) => p.name), categories: categories.map((c) => c.name), tags: [] });
};
