function generateWhatsAppLink(order) {
  const lines = order.items.map(item => `• ${item.name} x${item.quantity} – ₦${item.price}`);
  const message = `Hello 👋\n\nMy name is ${order.customerName}.\nI want to confirm my order:\n\n${lines.join('\n')}\n\nTotal: ₦${order.totalAmount}\n\nThank you 💖`;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encoded}`;
}

module.exports = { generateWhatsAppLink };
