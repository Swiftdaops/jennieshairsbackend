const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

const seedProducts = async () => {
  await mongoose.connect(process.env.MONGO_URI || '');

  const wigs = await Category.findOne({ name: 'Wigs' });
  const accessories = await Category.findOne({ name: 'Accessories' });

  await Product.deleteMany();

  await Product.insertMany([
    {
      name: 'Brazilian Body Wave Wig',
      slug: 'brazilian-body-wave-wig',
      description: 'Soft, natural-looking body wave wig',
      price: 45000,
      category: wigs?._id,
      stock: 8,
      isBestSeller: true,
      tags: ['luxury', 'human hair'],
      discount: { type: 'percentage', value: 10, isActive: true },
    },
    {
      name: 'Wig Cap',
      slug: 'wig-cap',
      description: 'Comfortable stretch wig cap',
      price: 1500,
      category: accessories?._id,
      stock: 25,
      tags: ['accessory'],
    },
  ]);

  console.log('Products seeded');
  process.exit();
};

seedProducts();
