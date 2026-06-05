const express = require("express");
const {
  getEvents,
  getEventById,
  createEvent,
  registerFree,
  checkInByQr,
  getTransactions
} = require("../controllers/eventController");
const { verifyToken, isOrganizer, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getEvents);
router.get("/transactions/list", verifyToken, isAdmin, getTransactions);
router.get("/:id", getEventById);
router.post("/", verifyToken, isOrganizer, createEvent);
router.post("/:id/register-free", verifyToken, registerFree);
router.post("/check-in", verifyToken, isOrganizer, checkInByQr);

module.exports = router;
