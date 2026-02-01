require('dotenv').config();
const mongoose = require('mongoose');
const seedAccessories = require('./seedAccessories');

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hairapp';
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');
    await seedAccessories();
    console.log('Accessories seeded (runner)');
  } catch (e) {
    console.error('Seeding error:', e);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
