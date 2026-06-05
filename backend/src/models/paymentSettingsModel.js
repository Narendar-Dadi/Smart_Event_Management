const mongoose = require("mongoose");

const paymentSettingsSchema = new mongoose.Schema(
  {
    keyId: { type: String, default: "" },
    secretKey: { type: String, default: "" },
    currency: { type: String, default: "INR" },
    mode: { type: String, enum: ["test", "live"], default: "test" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentSettings", paymentSettingsSchema);
