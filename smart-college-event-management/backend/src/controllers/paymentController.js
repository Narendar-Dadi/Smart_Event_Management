const crypto = require("crypto");
const mongoose = require("mongoose");
const Event = require("../models/eventModel");
const Transaction = require("../models/transactionModel");
const PaymentSettings = require("../models/paymentSettingsModel");
const { mapEvent } = require("../utils/mapEvent");
const {
  getPaymentConfig,
  getRazorpayInstance,
  computeTotal,
  verifyPaymentSignature,
  PLATFORM_FEE
} = require("../utils/razorpayClient");

function ensureDbConnected(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      message: "Database unavailable. Check MONGO_URI in backend/.env and try again."
    });
    return false;
  }
  return true;
}

exports.getPublicConfig = async (req, res) => {
  try {
    const config = await getPaymentConfig();
    return res.json({
      keyId: config.keyId,
      currency: config.currency,
      mode: config.mode,
      configured: Boolean(config.keyId && config.secretKey),
      platformFee: PLATFORM_FEE
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getSettings = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const config = await getPaymentConfig();
    const doc = await PaymentSettings.findOne().sort({ updatedAt: -1 }).lean();

    return res.json({
      keyId: config.keyId,
      hasSecret: Boolean(config.secretKey),
      currency: config.currency,
      mode: config.mode,
      source: process.env.RAZORPAY_KEY_ID ? "env" : doc ? "database" : "none"
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.saveSettings = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { keyId, secretKey, currency, mode } = req.body;

    const payload = {
      keyId: keyId || "",
      currency: currency || "INR",
      mode: mode || "test"
    };
    if (secretKey) payload.secretKey = secretKey;

    const existing = await PaymentSettings.findOne().sort({ updatedAt: -1 });
    if (existing) {
      existing.keyId = payload.keyId;
      existing.currency = payload.currency;
      existing.mode = payload.mode;
      if (secretKey) existing.secretKey = secretKey;
      await existing.save();
    } else {
      if (!secretKey) {
        return res.status(400).json({ message: "Secret key is required on first save" });
      }
      await PaymentSettings.create({ ...payload, secretKey });
    }

    return res.json({ message: "Payment settings saved" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { eventId, userName, userEmail } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.registered >= event.capacity || event.status === "Sold Out") {
      return res.status(400).json({ message: "Event is sold out" });
    }

    const total = computeTotal(event.fee);
    if (total === 0) {
      return res.status(400).json({ message: "Use free registration for this event" });
    }

    const { instance, config } = await getRazorpayInstance();
    if (!instance) {
      return res.status(503).json({
        message:
          "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env or Payment Settings."
      });
    }

    const receipt = `evt_${event._id}_${Date.now()}`;
    const order = await instance.orders.create({
      amount: total * 100,
      currency: config.currency,
      receipt,
      notes: {
        eventId: event._id.toString(),
        eventTitle: event.title,
        userName: userName || "Guest"
      }
    });

    return res.json({
      orderId: order.id,
      amount: total,
      currency: config.currency,
      keyId: config.keyId,
      event: mapEvent(event),
      userName,
      userEmail
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const {
      eventId,
      userName,
      userEmail,
      paymentId,
      orderId,
      signature
    } = req.body;

    const { config } = await getRazorpayInstance();
    if (!config.secretKey) {
      return res.status(503).json({ message: "Razorpay secret not configured" });
    }

    const valid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
      secretKey: config.secretKey
    });

    if (!valid) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.registered >= event.capacity) {
      return res.status(400).json({ message: "Event is sold out" });
    }

    const amount = computeTotal(event.fee);
    const ticketId = `TKT-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
    const qrToken = crypto.randomUUID();

    event.registrations.push({
      userName: userName || "Guest",
      userEmail: userEmail || "",
      ticketId,
      paymentId,
      orderId,
      amount,
      currency: config.currency,
      paymentStatus: "paid",
      qrToken
    });
    event.registered += 1;
    if (event.registered >= event.capacity) event.status = "Sold Out";
    await event.save();

    await Transaction.create({
      paymentId,
      orderId,
      amount,
      currency: config.currency,
      user: userName || "Guest",
      event: event.title,
      eventId: event._id,
      status: "Success"
    });

    return res.json({
      ticket: {
        event: mapEvent(event),
        ticketId,
        paymentId,
        orderId,
        signature,
        date: new Date().toISOString(),
        amount
      }
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
