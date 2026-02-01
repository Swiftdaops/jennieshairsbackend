// src/app.js

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const rateLimiter = require("./middlewares/rateLimit.middleware");
const errorHandler = require("./middlewares/error.middleware");

// Routes
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const orderRoutes = require("./routes/order.routes");
const searchRoutes = require("./routes/search.routes");
const uploadRoutes = require("./routes/upload.routes");
const innerCircleRoutes = require("./routes/innerCircle.routes");

// IMPORTANT: Do NOT connect to the database from `app.js`.
// Database lifecycle is controlled by `server.js` in normal runs
// and by the test harness when running tests.

const app = express();

/**
 * =========================
 * GLOBAL MIDDLEWARES
 * =========================
 */
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure CORS: allow a single origin or a comma-separated list via CLIENT_URL
const rawClient = process.env.CLIENT_URL || "http://localhost:3000";
const allowedOrigins = rawClient.split(",").map((s) => s.trim());

const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server or same-origin requests with no origin
    if (!origin) return callback(null, true);

    // Allow wildcard
    if (allowedOrigins.includes("*")) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error("CORS policy: This origin is not allowed."));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(rateLimiter);

/**
 * =========================
 * API ROUTES
 * =========================
 */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/inner-circle", innerCircleRoutes);

/**
 * =========================
 * HEALTH CHECK
 * =========================
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * =========================
 * 404 HANDLER
 * =========================
 */
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/**
 * =========================
 * GLOBAL ERROR HANDLER
 * =========================
 */
app.use(errorHandler);

module.exports = app;
