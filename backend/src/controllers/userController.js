const mongoose = require("mongoose");
const User = require("../models/userModel");

function ensureDbConnected(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ message: "Database unavailable. Check MONGO_URI and try again." });
    return false;
  }
  return true;
}

exports.getUsers = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json({ users: users.map((u) => u.toPublicJSON()) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createOrganizer = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "organizer"
    });

    return res.status(201).json({ user: user.toPublicJSON() });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "admin"
    });

    return res.status(201).json({ user: user.toPublicJSON() });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
