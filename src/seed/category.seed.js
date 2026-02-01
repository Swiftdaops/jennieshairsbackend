const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const categories = [
  { name: 'Wigs', description: 'Luxury human hair wigs' },
  { name: 'Hair Extensions', description: 'Premium hair bundles' },
  { name: 'Accessories', description: 'Wig caps, combs, brushes' },
  { name: 'Hair Creams', description: 'Styling and treatment creams' },
];

const seedCategories = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hairapp';
  await mongoose.connect(mongoUri);
  await Category.deleteMany();
  await Category.insertMany(categories);
  console.log('Categories seeded');
  process.exit();
};

seedCategories();
