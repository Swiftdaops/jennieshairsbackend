const mongoose = require('mongoose');
const User = require('../models/User');

// Load appropriate env file for test vs dev/prod
require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI || '');

  const exists = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (exists) {
    // Reset password to the plain env password so model pre-save hashes it once
    exists.password = process.env.ADMIN_PASSWORD;
    await exists.save();
    console.log('Admin exists — password reset');
    process.exit();
  }

  // Create user with plain password so the model's pre-save hook hashes it once
  await User.create({ name: 'Admin', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'admin' });

  console.log('Admin user created');
  process.exit();
};

seedAdmin();
