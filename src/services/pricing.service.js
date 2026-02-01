exports.calculateFinalPrice = (product) => {
  const obj = product.toObject ? product.toObject() : product;

  if (!obj.discount?.isActive) {
    obj.finalPrice = obj.price;
    return obj;
  }

  if (obj.discount.type === 'percentage') {
    obj.finalPrice = obj.price - obj.price * (obj.discount.value / 100);
  } else {
    obj.finalPrice = obj.price - obj.discount.value;
  }

  return obj;
};
