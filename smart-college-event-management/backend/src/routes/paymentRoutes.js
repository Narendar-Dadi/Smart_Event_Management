const express = require("express");
const {
  getPublicConfig,
  getSettings,
  saveSettings,
  createOrder,
  verifyPayment
} = require("../controllers/paymentController");

const router = express.Router();

router.get("/config", getPublicConfig);
router.get("/settings", getSettings);
router.put("/settings", saveSettings);
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

module.exports = router;
