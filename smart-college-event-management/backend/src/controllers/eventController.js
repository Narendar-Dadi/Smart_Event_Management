const crypto = require("crypto");
const mongoose = require("mongoose");
const Event = require("../models/eventModel");
const Transaction = require("../models/transactionModel");
const { mapEvent } = require("../utils/mapEvent");

function ensureDbConnected(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      message: "Database unavailable. Check MONGO_URI in backend/.env and try again."
    });
    return false;
  }
  return true;
}

exports.getEvents = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const events = await Event.find().sort({ date: 1 });
    return res.json(events.map(mapEvent));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getEventById = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    return res.json(mapEvent(event));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const event = await Event.create({
      ...req.body,
      registered: 0
    });
    return res.status(201).json(mapEvent(event));
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.registerFree = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { userName, userEmail } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.registered >= event.capacity || event.status === "Sold Out") {
      return res.status(400).json({ message: "Event is sold out" });
    }

    const ticketId = `TKT-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
    const qrToken = crypto.randomUUID();

    event.registrations.push({
      userName,
      userEmail: userEmail || "",
      ticketId,
      paymentStatus: "free",
      qrToken,
      amount: 0
    });
    event.registered += 1;
    if (event.registered >= event.capacity) event.status = "Sold Out";
    await event.save();

    const registration = event.registrations[event.registrations.length - 1];

    return res.status(201).json({
      ticket: {
        event: mapEvent(event),
        ticketId,
        date: registration.createdAt,
        paymentStatus: "free"
      }
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.checkInByQr = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { eventId, ticketId, qrToken } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const registration = event.registrations.find(
      (r) => r.ticketId === ticketId && r.qrToken === qrToken
    );
    if (!registration) {
      return res.status(404).json({ message: "Invalid ticket" });
    }

    registration.checkedIn = true;
    await event.save();

    return res.json({ message: "Check-in successful", ticketId });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(200);
    return res.json(
      transactions.map((t) => ({
        id: t.paymentId,
        orderId: t.orderId,
        amount: t.amount,
        currency: t.currency,
        user: t.user,
        event: t.event,
        status: t.status,
        date: t.createdAt
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
