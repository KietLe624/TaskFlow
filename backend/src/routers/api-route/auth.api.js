const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../middleware/auth.middleware");

// Import controller auth
const {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword
} = require("../../controllers/auth.controller");

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.patch("/change-password", authenticateToken, changePassword);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password", resetPassword);

module.exports = router;
