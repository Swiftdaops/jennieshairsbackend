const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    discount: {
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
      value: { type: Number, default: 0 },
      isActive: { type: Boolean, default: false },
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: String },
    images: [{ url: String, publicId: String }],
    stock: { type: Number, required: true, default: 0 },
    isBestSeller: { type: Boolean, default: false },
    tags: [String],
    frequentlyBoughtTogether: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Auto-generate slug from name
productSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toString().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric
      .replace(/(^-|-$)/g, '');    // trim - at start/end
  }
  next();
});

// Virtual for final price
productSchema.virtual('finalPrice').get(function () {
  if (!this.discount || !this.discount.isActive) return this.price;

  if (this.discount.type === 'percentage') {
    return this.price - (this.price * this.discount.value) / 100;
  }
  if (this.discount.type === 'fixed') {
    return Math.max(this.price - this.discount.value, 0);
  }
  return this.price;
});

// Ensure virtuals are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
