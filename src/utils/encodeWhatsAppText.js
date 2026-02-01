// utils/encodeWhatsAppText.js

/**
 * Generates encoded WhatsApp order confirmation text
 * @param {object} data
 * @param {string} data.customerName
 * @param {Array} data.items
 * @param {number} data.totalAmount
 * @param {string} data.address
 * @returns {string}
 */
const encodeWhatsAppText = ({
  customerName,
  items,
  totalAmount,
  address,
}) => {
  let message = `Hello 👋%0A%0A`;
  message += `My name is ${customerName}.%0A`;
  message += `I want to confirm my order:%0A%0A`;

  items.forEach((item) => {
    message += `• ${item.name} x${item.quantity} – ₦${item.price.toLocaleString()}%0A`;
  });

  message += `%0ATotal: ₦${totalAmount.toLocaleString()}%0A%0A`;
  message += `Delivery Address:%0A${address}%0A%0A`;
  message += `Thank you 💖`;

  return encodeURI(message);
};

module.exports = encodeWhatsAppText;
