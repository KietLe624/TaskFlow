const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");

// Middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cors());

// Import controller task
const {
    createTask,
    getAllTasks,
} = require("../../controllers/task.controller");

// Define routes
router.get("/getAllTasks", getAllTasks);
router.post("/createTask", createTask);


module.exports = router;