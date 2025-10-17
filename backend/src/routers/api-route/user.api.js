const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const { authenticateToken } = require("../../middleware/auth.middleware");


// Import controller user
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../../controllers/user.controller");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cors());

// User routes
router.get("/getAllUser", authenticateToken, getAllUsers);
router.get("/getUserById/:user_id", authenticateToken, getUserById);
router.put("/updateUser/:user_id", authenticateToken, updateUser);
router.delete("/deleteUser/:user_id", authenticateToken, deleteUser);

module.exports = router;
