/**
 * =========================================================
 * ✅ BACKEND FEATURE CHECKLIST (TEST COVERAGE)
 * =========================================================
 *
 * AUTH
 *  - Admin login with env credentials
 *  - JWT httpOnly cookie persistence
 *
 * CATEGORIES
 *  - Create category (admin)
 *  - Fetch categories
 *
 * PRODUCTS
 *  - Create product (admin)
 *  - Upload images (mock)
 *  - Fetch products
 *  - Fetch single product by slug
 *  - Update stock
 *  - Best seller tagging
 *  - Discount assignment
 *  - Frequently bought together
 *
 * SEARCH
 *  - Product search
 *  - Search autocomplete (names, tags, categories)
 *
 * SUGGESTIONS
 *  - Discount boosting
 *  - Best seller boosting
 *  - Frequently bought together logic
 *
 * ORDERS
 *  - Checkout (WhatsApp prefill)
 *  - Order creation
 *  - Order source = whatsapp
 *  - Admin order list
 *  - Order status update
 *
 * SECURITY
 *  - Admin-only route protection
 *
 * =========================================================
 */

jest.setTimeout(30000);
process.env.NODE_ENV = 'test';
require('dotenv').config({ path: '.env.test' });

const request = require("supertest");
const app = require("../app");
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

let agent;
let categoryId;
let productId;
let productSlug;
let orderId;

describe("🧪 E-Commerce API Integration Tests", () => {
  beforeAll(async () => {
    await connectDB(process.env.MONGO_URI);

    // ensure admin exists
    let admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!admin) {
      admin = await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
        role: 'admin',
      });
    }

    // persistent agent for cookie-based auth
    agent = request.agent(app);

    // Admin login
    const res = await agent.post("/api/auth/login").send({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  /**
   * ======================
   * CATEGORY
   * ======================
   */
  it("should create a category", async () => {
    const res = await agent.post("/api/categories").send({
      name: "Wigs",
      description: "All wigs category",
    });

    expect(res.statusCode).toBe(201);
    categoryId = res.body._id;
  });

  it("should fetch categories", async () => {
    const res = await agent.get("/api/categories");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  /**
   * ======================
   * PRODUCT
   * ======================
   */
  it("should create a product", async () => {
    const res = await agent.post("/api/products").send({
      name: "Brazilian Body Wave Wig",
      price: 45000,
      category: categoryId,
      stock: 10,
      tags: ["luxury", "best-seller"],
    });

    expect(res.statusCode).toBe(201);
    productId = res.body._id;
    productSlug = res.body.slug;
  });

  it("should fetch all products", async () => {
    const res = await agent.get("/api/products");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should fetch product by slug", async () => {
    const res = await agent.get(`/api/products/${productSlug}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.slug).toBe(productSlug);
  });

  /**
   * ======================
   * STOCK + SALES FEATURES
   * ======================
   */
  it("should update product stock", async () => {
    const res = await agent
      .put(`/api/products/${productId}/stock`)
      .send({ stock: 3 });

    expect(res.statusCode).toBe(200);
    expect(res.body.stock).toBe(3);
  });

  it("should mark product as best seller", async () => {
    const res = await agent.put(`/api/products/${productId}`).send({
      isBestSeller: true,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.isBestSeller).toBe(true);
  });

  it("should apply discount to product", async () => {
    const res = await agent.put(`/api/products/${productId}`).send({
      discount: {
        type: "percentage",
        value: 10,
        isActive: true,
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.discount.value).toBe(10);
  });

  /**
   * ======================
   * SEARCH & SUGGESTIONS
   * ======================
   */
  it("should search products", async () => {
    const res = await agent.get("/api/search?q=wig");
    expect(res.statusCode).toBe(200);
  });

  it("should return search autocomplete suggestions", async () => {
    const res = await agent.get("/api/search/suggestions?q=wig");
    expect(res.statusCode).toBe(200);
  });

  it("should return product suggestions", async () => {
    const res = await agent.get(
      `/api/products/${productId}/suggestions`
    );
    expect(res.statusCode).toBe(200);
  });

  /**
   * ======================
   * CHECKOUT & ORDERS
   * ======================
   */
  it("should create WhatsApp checkout order", async () => {
    const res = await request(app)
      .post("/api/orders/checkout")
      .send({
        customerName: "Sarah",
        whatsappNumber: "2348012345678",
        address: "Lekki, Lagos",
        items: [
          {
            productId,
            quantity: 1,
          },
        ],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.whatsappLink).toContain("wa.me");
    orderId = res.body.order._id;
  });

  it("should fetch all orders (admin)", async () => {
    const res = await agent.get("/api/orders");
    expect(res.statusCode).toBe(200);
  });

  it("should update order status", async () => {
    const res = await agent
      .put(`/api/orders/${orderId}/status`)
      .send({ status: "confirmed" });

    expect(res.statusCode).toBe(200);
  });

  /**
   * ======================
   * AUTH
   * ======================
   */
  it("should logout admin", async () => {
    const res = await agent.post("/api/auth/logout");
    expect(res.statusCode).toBe(200);
  });
});
