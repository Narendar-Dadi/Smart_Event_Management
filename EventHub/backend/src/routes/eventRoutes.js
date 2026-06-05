const express = require("express");
const {
  getEvents,
  getEventById,
  createEvent,
  registerFree,
  checkInByQr,
  getTransactions
} = require("../controllers/eventController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getEvents);
router.get("/transactions/list", authenticate, authorize("admin"), getTransactions);
router.get("/:id", getEventById);
router.post("/", authenticate, authorize("admin", "organizer"), createEvent);
router.post("/:id/register-free", authenticate, registerFree);
router.post("/check-in", authenticate, authorize("admin", "organizer"), checkInByQr);

module.exports = router;
