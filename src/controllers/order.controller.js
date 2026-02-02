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

  // Send admin notification with order summary (if EmailJS configured)
  try {
    const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const adminTemplateId = process.env.EMAILJS_ADMIN_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID || 'template_r0o7ufi';
    const userId = process.env.EMAILJS_USER || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'tobepersonnalmail@gmail.com';

    if (serviceId && adminTemplateId && userId) {
      const Product = require('../models/Product');
      const productIds = (order.items || [])
        .map((it) => it.productId)
        .filter(Boolean);
      const products = await Product.find(
        { _id: { $in: productIds } },
        { images: 1 }
      ).lean();

      const productImageById = new Map(
        (products || []).map((p) => {
          const firstImage = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null;
          const url = typeof firstImage === 'string' ? firstImage : (firstImage && firstImage.url) ? firstImage.url : '';
          return [String(p._id), url];
        })
      );

      const ordersForTemplate = (order.items || []).map((it) => ({
        name: it.name || '',
        units: it.quantity || 0,
        price: Number(it.price || 0),
        image_url: productImageById.get(String(it.productId)) || '',
      }));

      const adminParams = {
        to_name: 'Admin',
        to_email: adminEmail,
        order_id: order._id.toString(),
        customer_name: order.customerName || '',
        email: order.email || '',
        phone: order.whatsappNumber || '',
        orders: ordersForTemplate,
        cost: {
          shipping: Number(order.shipping || 0),
          tax: Number(order.tax || 0),
          total: Number(order.totalAmount || 0),
        },
        order_date: (order.createdAt || new Date()).toISOString(),
      };

      const _fetch = global.fetch || (await import('node-fetch')).default;
      await _fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: serviceId, template_id: adminTemplateId, user_id: userId, template_params: adminParams }),
      });
    }
  } catch (err) {
    console.warn('EmailJS admin notification failed', err);
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
