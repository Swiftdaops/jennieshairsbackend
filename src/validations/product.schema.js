const { z } = require('zod');

exports.productSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  category: z.string(), // MongoDB ObjectId
  subCategory: z.string().optional(),

  stock: z.number().int().min(0),

  tags: z.array(z.string()).optional(),

  isBestSeller: z.boolean().optional(),

  discount: z
    .object({
      type: z.enum(['percentage', 'fixed']),
      value: z.number().positive(),
      isActive: z.boolean(),
    })
    .optional(),

  frequentlyBoughtTogether: z.array(z.string()).optional(),
});
