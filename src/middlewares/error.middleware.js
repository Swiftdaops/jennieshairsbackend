module.exports = (err, req, res, next) => {
  console.error(err);

  // Ensure CORS headers are present even for error responses so browsers
  // don't block the real error message when the server fails before CORS is applied.
  try {
    const rawClient = process.env.CLIENT_URL || "http://localhost:3000,https://jennieshaircollection.vercel.app";
    const allowedOrigins = rawClient.split(",").map((s) => s.trim());
    const origin = req.headers.origin;

    if (origin) {
      if (allowedOrigins.includes("*")) {
        res.setHeader("Access-Control-Allow-Origin", "*");
      } else if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
      }
    }
  } catch (e) {
    // ignore header setting errors
  }

  res.status(500).json({ error: "Internal Server Error" });
};
