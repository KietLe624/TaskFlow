const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../middleware/auth.middleware");

// Import controller user
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../../controllers/user.controller");

// User routes
router.get("/getAllUser", authenticateToken, getAllUsers);
router.get("/getUserById/:user_id", authenticateToken, getUserById);
router.put("/updateUser/:user_id", authenticateToken, updateUser);
router.delete("/deleteUser/:user_id", authenticateToken, deleteUser);

module.exports = router;
