const mongoose = require("mongoose");
const User = require("../models/userModel");
const { signToken } = require("../middleware/authMiddleware");

function ensureDbConnected(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ message: "Database unavailable. Check MONGO_URI and try again." });
    return false;
  }
  return true;
}

exports.register = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { name, email, password, role } = req.body;

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

    // Public registration is student-only; admin/organizer accounts are seeded
    const allowedRole = role === "organizer" || role === "admin" ? "student" : role || "student";

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: allowedRole
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json({ user: user.toPublicJSON() });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
