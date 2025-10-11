const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");

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
router.get("/getAllUser", getAllUsers);
router.get("/getUserById/:user_id", getUserById);
router.put("/updateUser/:user_id", updateUser);
router.delete("/deleteUser/:user_id", deleteUser);

module.exports = router;
