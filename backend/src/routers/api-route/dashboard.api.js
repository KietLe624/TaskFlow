const express = require("express");
const router = express.Router();

// Import middleware
const { authenticateToken } = require("../../middleware/auth.middleware");

router.use(authenticateToken);

// Import controller auth
const { getDashboards } = require("../../controllers/dashboard.controller");

// Dashboard routes
router.get("/dashboard", authenticateToken, getDashboards);

module.exports = router;
