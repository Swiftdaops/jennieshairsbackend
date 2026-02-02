const { z } = require('zod');

const checkoutSchema = z.object({
  customerName: z.string().min(2),
  whatsappNumber: z.string().min(10),
  address: z.string().min(5),
  email: z.string().email().optional(),

  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
    })
  ),

  totalAmount: z.number().positive(),
  shipping: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),
});

exports.checkoutSchema = checkoutSchema;
