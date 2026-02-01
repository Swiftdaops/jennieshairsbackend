// utils/calculateDiscount.js

/**
 * Calculates discounted price
 * @param {number} price - original price
 * @param {object} discount - discount object
 * @param {"percentage"|"fixed"} discount.type
 * @param {number} discount.value
 * @param {boolean} discount.isActive
 * @returns {object}
 */
const calculateDiscount = (price, discount) => {
  if (!discount || !discount.isActive) {
    return {
      originalPrice: price,
      discountedPrice: price,
      discountAmount: 0,
    };
  }

  let discountAmount = 0;

  if (discount.type === "percentage") {
    discountAmount = (price * discount.value) / 100;
  }

  if (discount.type === "fixed") {
    discountAmount = discount.value;
  }

  // Prevent negative prices
  const discountedPrice = Math.max(price - discountAmount, 0);

  return {
    originalPrice: price,
    discountedPrice,
    discountAmount,
  };
};

module.exports = calculateDiscount;
