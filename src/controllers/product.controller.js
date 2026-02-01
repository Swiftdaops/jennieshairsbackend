const Product = require('../models/Product');
const { calculateFinalPrice } = require('../services/pricing.service');
const { getSuggestions } = require('../services/suggestion.service');

// Get all products (public)
exports.getAllProducts = async (_, res) => {
  try {
    const products = await Product.find().populate('category'); // category populated
    const formatted = products.map(calculateFinalPrice);
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Get product by slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(calculateFinalPrice(product));
  } catch (err) {
    console.error('Error fetching product by slug:', err);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

// Create a new product (admin)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

// Update product (admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// Delete product (admin)
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// Get suggestions
exports.getProductSuggestions = async (req, res) => {
  try {
    const suggestions = await getSuggestions(req.params.id);
    res.json(suggestions);
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    res.status(500).json({ message: 'Failed to fetch suggestions' });
  }
};

// Best sellers
exports.getBestSellers = async (_, res) => {
  try {
    const products = await Product.find({ isBestSeller: true }).populate('category');
    res.json(products.map(calculateFinalPrice));
  } catch (err) {
    console.error('Error fetching best sellers:', err);
    res.status(500).json({ message: 'Failed to fetch best sellers' });
  }
};

// Discounted products
exports.getDiscountedProducts = async (_, res) => {
  try {
    const products = await Product.find({ 'discount.isActive': true }).populate('category');
    res.json(products.map(calculateFinalPrice));
  } catch (err) {
    console.error('Error fetching discounted products:', err);
    res.status(500).json({ message: 'Failed to fetch discounted products' });
  }
};

// Update stock
exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error updating stock:', err);
    res.status(500).json({ message: 'Failed to update stock' });
  }
};

// Update frequently bought together
exports.updateFrequentlyBought = async (req, res) => {
  try {
    const { frequentlyBoughtTogether } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { frequentlyBoughtTogether },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error updating frequently bought together:', err);
    res.status(500).json({ message: 'Failed to update frequently bought together' });
  }
};
