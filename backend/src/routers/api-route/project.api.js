const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../middleware/auth.middleware");

// Import controller project
const {
  createProject,
  updateProject,
  deleteProject,
  getAllProjects,
  getProjectsByUserId,
} = require("../../controllers/project.controller");

// Define routes

router.get("/getAllProjects", authenticateToken, getAllProjects);
router.post("/createProject", authenticateToken, createProject);
router.patch("/updateProject/:project_id", authenticateToken, updateProject);
router.delete("/deleteProject/:project_id", authenticateToken, deleteProject);
router.get("/getProjectsByUserId/:user_id", authenticateToken, getProjectsByUserId);

module.exports = router;
