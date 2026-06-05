const express = require("express");
const {
  getEvents,
  getEventById,
  createEvent,
  registerFree,
  checkInByQr,
  getTransactions
} = require("../controllers/eventController");

const router = express.Router();

router.get("/", getEvents);
router.get("/transactions/list", getTransactions);
router.get("/:id", getEventById);
router.post("/", createEvent);
router.post("/:id/register-free", registerFree);
router.post("/check-in", checkInByQr);

module.exports = router;
