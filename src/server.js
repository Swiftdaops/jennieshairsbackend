// src/server.js

require("dotenv").config();
const http = require("http");

const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

/**
 * =========================
 * START SERVER
 * =========================
 */
const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGINT", () => {
      console.log("🛑 Server shutting down...");
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
