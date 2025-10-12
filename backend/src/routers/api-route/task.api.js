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
  getTasksByUserId,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../../controllers/task.controller");

// Define routes
router.get("/getAllTasks", getAllTasks);
router.post("/createTask", createTask);
router.get("/getTasksByUserId/:user_id", getTasksByUserId);
router.get("/getTaskById/:task_id", getTaskById);
router.patch("/updateTask/:task_id", updateTask);
router.delete("/deleteTask/:task_id", deleteTask);

module.exports = router;
