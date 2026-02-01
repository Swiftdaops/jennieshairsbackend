const Product = require('../models/Product');

exports.getSuggestions = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) return [];

  let suggestions = [];

  if (product.frequentlyBoughtTogether?.length) {
    suggestions = await Product.find({
      _id: { $in: product.frequentlyBoughtTogether },
    });
  }

  if (!suggestions.length) {
    suggestions = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);
  }

  return suggestions.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.discount?.isActive) scoreA += 3;
    if (a.isBestSeller) scoreA += 2;

    if (b.discount?.isActive) scoreB += 3;
    if (b.isBestSeller) scoreB += 2;

    return scoreB - scoreA;
  });
};

