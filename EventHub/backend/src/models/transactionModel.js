const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true },
    orderId: { type: String, default: "N/A" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    user: { type: String, required: true },
    event: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    status: { type: String, default: "Success" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
