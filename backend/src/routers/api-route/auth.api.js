const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../middleware/auth.middleware");

// Import controller auth
const {
  register,
  login,
  changePassword,
  forgotPassword,
} = require("../../controllers/auth.controller");

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.patch("/change-password", authenticateToken, changePassword);
router.post("/forgot-password", authenticateToken, forgotPassword);

module.exports = router;
