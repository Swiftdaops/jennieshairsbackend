const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  // In development allow lax so cookies are sent from localhost dev servers.
  // In production, set to 'none' and require secure (HTTPS).
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
};

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  console.log('[auth] login attempt for', email);
  const admin = await User.findOne({ email });
  console.log('[auth] admin found?', !!admin);
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, admin.password);
  console.log('[auth] password match:', isMatch);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

  res.cookie('token', token, COOKIE_OPTIONS).json({ success: true });
};

exports.logoutAdmin = async (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS).json({ success: true });
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};
