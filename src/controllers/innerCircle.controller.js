const InnerCircle = require('../models/InnerCircle');

// Public: create a new inner circle signup
exports.createSignup = async (req, res) => {
  try {
    const { email, name, phone } = req.body;
    if (!email || typeof email !== 'string') return res.status(400).json({ message: 'Invalid email' });

    const normalized = String(email).trim().toLowerCase();

    // upsert: avoid duplicate errors
    let existing = await InnerCircle.findOne({ email: normalized });
    if (existing) {
      let changed = false;
      if (name && existing.name !== name) {
        existing.name = name;
        changed = true;
      }
      if (phone && existing.phone !== phone) {
        existing.phone = phone;
        changed = true;
      }
      if (changed) await existing.save();
      return res.status(200).json({ message: 'Already subscribed', existing });
    }

    const doc = await InnerCircle.create({ email: normalized, name, phone });
    res.status(201).json(doc);
  } catch (err) {
    console.error('Failed to create inner circle signup', err);
    res.status(500).json({ message: 'Failed to create signup' });
  }
};

// Admin: list signups
exports.listSignups = async (req, res) => {
  try {
    const items = await InnerCircle.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('Failed to list signups', err);
    res.status(500).json({ message: 'Failed to list signups' });
  }
};

// Admin: delete a signup
exports.deleteSignup = async (req, res) => {
  try {
    const doc = await InnerCircle.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete signup', err);
    res.status(500).json({ message: 'Failed to delete signup' });
  }
};
