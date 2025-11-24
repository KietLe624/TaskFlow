const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../middleware/auth.middleware");
const { getCalendarTasks } = require("../../controllers/calendar.controller");

// routes
router.get("/", authenticateToken, getCalendarTasks);

module.exports = router;
