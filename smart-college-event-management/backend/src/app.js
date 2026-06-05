const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const eventRoutes = require("./routes/eventRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { seedDatabase } = require("./utils/seedDatabase");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/events", eventRoutes);
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-events";
const MONGO_RETRY_MS = Number(process.env.MONGO_RETRY_MS || 10000);

mongoose.set("bufferCommands", false);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
});

async function connectMongoWithRetry() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("MongoDB connected");
    await seedDatabase();
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.log(`Retrying MongoDB in ${MONGO_RETRY_MS / 1000}s...`);
    setTimeout(connectMongoWithRetry, MONGO_RETRY_MS);
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Reconnecting...");
  setTimeout(connectMongoWithRetry, MONGO_RETRY_MS);
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime error:", err.message);
});

connectMongoWithRetry();
