const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");

// Import controller auth
const {
  register,
  login,
  changePassword,
  forgotPassword,
} = require("../../controllers/auth.controller");

// Middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cors());

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.patch("/change-password", changePassword);
router.post("/forgot-password", forgotPassword);

module.exports = router;
