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

const app = express();

// Render/Cloud providers often sit behind a proxy; this helps secure cookies behave correctly.
app.set("trust proxy", 1);

/**
 * =========================
 * GLOBAL MIDDLEWARES
 * =========================
 */
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * =========================
 * CORS CONFIGURATION
 * =========================
 */
let rawClient = process.env.CLIENT_URL || "http://localhost:3000";

// In production default to the public storefront if CLIENT_URL is not set
if (process.env.NODE_ENV === 'production' && rawClient === 'http://localhost:3000') {
  rawClient = 'https://www.jennieshairscollection.store';
}

const extraOrigins = [
  "http://127.0.0.1:3000",
  "http://localhost:3000",
  "http://127.0.0.1:5000",
  "http://localhost:5000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "https://jennieshairscollection.store",
  "https://www.jennieshairscollection.store",
];

const allowedOrigins = Array.from(
  new Set(
    rawClient
      .split(",")
      .map((s) => s.trim())
      .concat(extraOrigins)
  )
);

const corsOptions = {
  origin(origin, callback) {
    // Allow same-origin, server-to-server, curl, postman
    if (!origin) return callback(null, true);

    // Allow wildcard explicitly if configured
    if (allowedOrigins.includes("*")) return callback(null, origin);

    // Exact match
    if (allowedOrigins.includes(origin)) return callback(null, origin);

    // Allow any subdomain or www variant for the primary production domain
    try {
      const host = new URL(origin).hostname;
      if (host.endsWith("jennieshairscollection.store") || host.endsWith("jennieshaircollection.store")) {
        return callback(null, origin);
      }
    } catch (e) {
      // ignore parsing errors
    }

    // IMPORTANT: deny silently (do NOT throw)
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(rateLimiter);

/**
 * =========================
 * ROOT & HEALTH
 * =========================
 */
app.get("/", (req, res) => {
  res.status(200).json({
    name: "Jennies Hairs API",
    status: "running",
    uptime: process.uptime(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

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
