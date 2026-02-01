require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hairapp';

const product = {
  name: 'Royal Platinum Luxe 30" Body Wave Wig',
  slug: 'royal-platinum-luxe-30-body-wave-wig',
  description:
    'Experience the height of luxury with our Royal Platinum Luxe Body Wave Wig. Exclusively 100% Virgin Human Hair crafted for queens who demand flawless texture, silky shine, and opulent length. Available only in 30 inches and longer, this wig delivers unrivaled elegance and movement.',
  price: 1670000,
  stock: 5,
  tags: ['luxury', 'premium', '30 inches', 'platinum', 'body wave', 'exclusive'],
  isBestSeller: false,
  discount: { type: 'percentage', value: 0, isActive: false },
  images: [
    { url: 'https://yourcdn.com/path/royal-platinum-luxe-30-body-wave-front.jpg', publicId: '' },
    { url: 'https://yourcdn.com/path/royal-platinum-luxe-30-body-wave-side.jpg', publicId: '' },
    { url: 'https://yourcdn.com/path/royal-platinum-luxe-30-body-wave-back.jpg', publicId: '' },
  ],
  attributes: {
    texture: 'Body Wave',
    colors: ['Platinum Blonde'],
    inchesOptions: [25, 28, 30, 32],
    hairType: '100% Virgin Human Hair',
    laceType: 'HD Lace Frontal',
    densityOptions: ['180%', '200%'],
    capSize: 'Average (Adjustable)',
    lifespan: '12–30 months with proper care',
    specialFeature: 'Hand-tied silk base for natural parting and scalp appearance',
  },
};

async function seedRoyalPlatinum() {
  await mongoose.connect(MONGO_URI);

  // Try to find category by slug first, then case-insensitive name
  let wigsCategory = await Category.findOne({ slug: 'wigs' });
  if (!wigsCategory) {
    wigsCategory = await Category.findOne({ name: /wigs/i });
  }
  if (!wigsCategory) {
    console.error("Category 'Wigs' not found. Create the category first or adjust the name.");
    process.exit(1);
  }

  product.category = wigsCategory._id;

  const existing = await Product.findOne({ slug: product.slug });
  if (existing) {
    console.log('Product already exists — updating existing entry');
    await Product.findByIdAndUpdate(existing._id, product, { new: true });
    console.log('Product updated.');
  } else {
    await Product.create(product);
    console.log('Product created.');
  }

  process.exit(0);
}

seedRoyalPlatinum();
