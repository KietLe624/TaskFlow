const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");

// Middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cors());
// Import middleware
const { authenticateToken } = require("../../middleware/auth.middleware");

router.use(authenticateToken);

// Import controller auth
const { getDashboards } = require("../../controllers/dashboard.controller");

// Dashboard routes
router.get("/dashboard", authenticateToken, getDashboards);

module.exports = router;
