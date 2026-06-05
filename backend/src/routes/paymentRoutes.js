const express = require("express");
const {
  getPublicConfig,
  getSettings,
  saveSettings,
  createOrder,
  verifyPayment
} = require("../controllers/paymentController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/config", getPublicConfig);
router.get("/settings", verifyToken, isAdmin, getSettings);
router.put("/settings", verifyToken, isAdmin, saveSettings);
router.post("/create-order", verifyToken, createOrder);
router.post("/verify", verifyToken, verifyPayment);

module.exports = router;
