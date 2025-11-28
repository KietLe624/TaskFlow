const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../middleware/auth.middleware");

// Import controller task
const {
  createTask,
  getAllTasks,
  getTasksByUserId,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByProjectId,
  getStatus,
  getPriorities,
  addComment,
  getComments,
  searchTasks,
} = require("../../controllers/task.controller");

// Define routes
router.get("/getAllTasks", authenticateToken, getAllTasks);
router.post("/createTask", authenticateToken, createTask);
router.get("/getTasksByUserId/:user_id", authenticateToken, getTasksByUserId);
router.get("/getTaskById/:task_id", authenticateToken, getTaskById);
router.patch("/updateTask/:task_id", authenticateToken, updateTask);
router.delete("/deleteTask/:task_id", authenticateToken, deleteTask);
router.get(
  "/getTasksByProjectId/:project_id",
  authenticateToken,
  getTasksByProjectId
);
router.get("/getStatus", authenticateToken, getStatus);
router.get("/getPriorities", authenticateToken, getPriorities);
router.post("/:task_id/comments", authenticateToken, addComment);
router.get("/:task_id/comments", authenticateToken, getComments);
router.get("/search", authenticateToken, searchTasks);

module.exports = router;
