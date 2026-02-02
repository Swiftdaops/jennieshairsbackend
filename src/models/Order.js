const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },

    whatsappNumber: {
      type: String,
      required: true,
    },

    email: {
      type: String,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    shipping: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "in_transit", "delivered", "cancelled"],
      default: "pending",
    },

    source: {
      type: String,
      default: "whatsapp",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
