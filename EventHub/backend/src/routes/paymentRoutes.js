const express = require("express");
const {
  getPublicConfig,
  getSettings,
  saveSettings,
  createOrder,
  verifyPayment
} = require("../controllers/paymentController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/config", getPublicConfig);
router.get("/settings", authenticate, authorize("admin"), getSettings);
router.put("/settings", authenticate, authorize("admin"), saveSettings);
router.post("/create-order", authenticate, createOrder);
router.post("/verify", authenticate, verifyPayment);

module.exports = router;
