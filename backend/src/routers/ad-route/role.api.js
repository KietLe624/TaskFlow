const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  isAdmin,
} = require("../../middleware/auth.middleware");

// Import controller role
const { changeUserRole } = require("../../controllers/user.controller");

// Role routes
router.patch(
  "/changeUserRole/:user_id",
  [authenticateToken, isAdmin],
  changeUserRole
);
// router.patch("/changeUserRole/:user_id", authenticateToken, changeUserRole);
module.exports = router;
