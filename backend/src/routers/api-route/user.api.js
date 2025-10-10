const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");

// Import controller user
const { getAllUsers } = require("../../controllers/dashboard.controller");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cors());

// User routes
router.get("/users", getAllUsers);

module.exports = router;
