const express = require('express');
const { createOrder, getOrders, getOrderById, updateOrderStatus, checkout, getInsights, deleteOrder } = require('../controllers/order.controller');
const protect = require('../middlewares/auth.middleware');
const adminOnly = require('../middlewares/admin.middleware');
const validate = require('../middlewares/validate.middleware');
const { checkoutSchema } = require('../validations/order.schema');

const router = express.Router();

router.post('/checkout', validate(checkoutSchema), checkout);
router.get('/insights', protect, adminOnly, getInsights);
router.get('/', protect, adminOnly, getOrders);
router.get('/:id', protect, adminOnly, getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/:id', protect, adminOnly, deleteOrder);

module.exports = router;
