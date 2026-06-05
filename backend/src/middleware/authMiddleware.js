const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET || "eventhub-dev-secret-change-in-production";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required. Please sign in." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please sign in again." });
  }
}

const authenticate = verifyToken;
const isAuthenticated = verifyToken;

function isAdmin(req, res, next) {
  if (!req.userRole) {
    return res.status(401).json({ message: "Authentication required." });
  }
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "You do not have permission for this action." });
  }
  next();
}

function isOrganizer(req, res, next) {
  if (!req.userRole) {
    return res.status(401).json({ message: "Authentication required." });
  }
  if (req.userRole !== "admin" && req.userRole !== "organizer") {
    return res.status(403).json({ message: "You do not have permission for this action." });
  }
  next();
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ message: "Authentication required." });
    }
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: "You do not have permission for this action." });
    }
    next();
  };
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
  } catch {
    // ignore invalid token for optional routes
  }
  next();
}

async function attachUser(req, res, next) {
  if (!req.userId) return next();
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: "User not found." });
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  JWT_SECRET,
  signToken,
  verifyToken,
  authenticate,
  isAuthenticated,
  isAdmin,
  isOrganizer,
  optionalAuth,
  authorize,
  attachUser
};
