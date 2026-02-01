const Order = require('../models/Order');
const { generateWhatsAppLink } = require('../services/whatsapp.service');

exports.getInsights = async (req, res) => {
  // Top 5 selling products by revenue (totalSales)
  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: { id: '$items.productId', name: '$items.name' },
        totalQty: { $sum: '$items.quantity' },
        totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: 5 },
  ]);

  // Orders by status
  const ordersByStatusAgg = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const ordersByStatus = ordersByStatusAgg.reduce((acc, cur) => {
    acc[cur._id] = cur.count;
    return acc;
  }, {});

  // Category performance: sum quantities and sales grouped by category name
  const categoryPerf = await Order.aggregate([
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $lookup: {
        from: 'categories',
        localField: 'product.category',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $group: {
        _id: '$category.name',
        totalQty: { $sum: '$items.quantity' },
        totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $project: { category: '$_id', totalQty: 1, totalSales: 1, _id: 0 } },
  ]);

  // Today's orders
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todaysOrders = await Order.countDocuments({ createdAt: { $gte: startOfToday } });

  // Pending WhatsApp confirmations: orders with source 'whatsapp' and status 'pending'
  const pendingWhatsAppConfirmations = await Order.countDocuments({ source: 'whatsapp', status: 'pending' });

  // Low stock products and active discounts and best seller count
  const Product = require('../models/Product');
  const LOW_STOCK_THRESHOLD = 5;
  const lowStockCount = await Product.countDocuments({ stock: { $lte: LOW_STOCK_THRESHOLD } });
  const activeDiscountsCount = await Product.countDocuments({ 'discount.isActive': true });
  const bestSellersCount = await Product.countDocuments({ isBestSeller: true });

  res.json({
    topProducts,
    ordersByStatus,
    categoryPerf,
    todaysOrders,
    pendingWhatsAppConfirmations,
    lowStockCount,
    activeDiscountsCount,
    bestSellersCount,
  });
};

exports.checkout = async (req, res) => {
  const order = await Order.create({ ...req.body, status: 'pending', source: 'whatsapp' });
  const whatsappLink = generateWhatsAppLink(order);

  // Send email receipt via EmailJS (if configured and order has email)
  try {
    const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const userId = process.env.EMAILJS_USER || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (serviceId && templateId && userId && order.email) {
      const itemsText = (order.items || []).map(it => `${it.name} x${it.quantity} — ₦${it.price}`).join('\n');
      const templateParams = {
        to_name: order.customerName,
        to_email: order.email,
        order_id: order._id.toString(),
        items: itemsText,
        total: order.totalAmount,
        status: order.status,
      };

      // Node 18+ has global fetch; fallback if not present
      const _fetch = global.fetch || (await import('node-fetch')).default;
      await _fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: serviceId, template_id: templateId, user_id: userId, template_params: templateParams }),
      });
    }
  } catch (err) {
    console.warn('EmailJS receipt send failed', err);
  }

  res.status(201).json({ order, whatsappLink });
};

exports.getOrders = async (_, res) => {
  const orders = await Order.find().sort('-createdAt');
  res.json(orders);
};

exports.getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json(order);
};

exports.updateOrderStatus = async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(order);
};

exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete order' });
  }
};
