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

    // Ensure admin user exists
    try {
      const User = require("./models/User");
      const bcrypt = require("bcryptjs");
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (adminEmail && adminPassword) {
        const existing = await User.findOne({ email: adminEmail });
        if (!existing) {
          const hashed = await bcrypt.hash(adminPassword, 10);
          await User.create({ email: adminEmail, password: hashed, role: "admin", name: "Admin" });
          console.log(`[seed] created admin ${adminEmail}`);
        } else {
          console.log(`[seed] admin exists: ${adminEmail}`);
        }
      } else {
        console.log("[seed] ADMIN_EMAIL or ADMIN_PASSWORD not set; skipping admin seed");
      }
    } catch (e) {
      console.error("[seed] failed to ensure admin user:", e);
    }

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
