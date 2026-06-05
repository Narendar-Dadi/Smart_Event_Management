const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    userEmail: { type: String, default: "" },
    ticketId: { type: String, required: true },
    paymentId: String,
    orderId: String,
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "free"],
      default: "pending"
    },
    checkedIn: { type: Boolean, default: false },
    qrToken: { type: String, required: true }
  },
  { timestamps: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: "Technical" },
    date: { type: String, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    registered: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
    image: { type: String, default: "" },
    organizer: { type: String, default: "Event Organizer" },
    status: {
      type: String,
      enum: ["Active", "Sold Out", "Upcoming"],
      default: "Active"
    },
    registrations: [registrationSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
