const mongoose = require("mongoose");

const connectDB = async (uri) => {
  if (!uri) throw new Error("MONGO_URI is required");

  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(uri);
  return conn;
};

const disconnectDB = async () => {
  await mongoose.connection.close();
};

module.exports = { connectDB, disconnectDB };
