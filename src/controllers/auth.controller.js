const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Cross-domain auth cookie (Frontend .store -> Backend .onrender.com)
// Note: `sameSite: 'none'` requires `secure: true` in modern browsers.
const isProd = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('[auth] login attempt for', email);
    const admin = await User.findOne({ email });
    
    if (!admin) {
      console.log('[auth] admin not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log('[auth] password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // Set cookie and send response
    return res.cookie('token', token, COOKIE_OPTIONS).json({ 
      success: true,
      user: { id: admin._id, email: admin.email, role: admin.role }
    });
  } catch (error) {
    console.error('[auth] Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.logoutAdmin = async (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS).json({ success: true });
};

exports.getMe = async (req, res) => {
  // req.user is populated by the protect middleware
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  res.json(req.user);
};