const express = require("express");
const { getUsers, createOrganizer, createAdmin } = require("../controllers/userController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, isAdmin, getUsers);
router.post("/organizer", verifyToken, isAdmin, createOrganizer);
router.post("/admin", verifyToken, isAdmin, createAdmin);

module.exports = router;
