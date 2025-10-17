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
const { authenticateToken } = require("../../middleware/auth.middleware");

// Define routes
router.get("/getAllTasks", authenticateToken, getAllTasks);
router.post("/createTask", authenticateToken, createTask);
router.get("/getTasksByUserId/:user_id", authenticateToken, getTasksByUserId);
router.get("/getTaskById/:task_id", authenticateToken, getTaskById);
router.patch("/updateTask/:task_id", authenticateToken, updateTask);
router.delete("/deleteTask/:task_id", authenticateToken, deleteTask);

module.exports = router;
