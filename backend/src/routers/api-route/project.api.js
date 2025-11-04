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
  getStatus,
  getPriorities,
  getProjectById,
} = require("../../controllers/project.controller");

// Define routes

router.get("/getAllProjects", authenticateToken, getAllProjects);
router.get("/getProjectById/:project_id", authenticateToken, getProjectById);
router.post("/createProject", authenticateToken, createProject);
router.patch("/updateProject/:project_id", authenticateToken, updateProject);
router.delete("/deleteProject/:project_id", authenticateToken, deleteProject);
router.get(
  "/getProjectsByUserId/:user_id",
  authenticateToken,
  getProjectsByUserId
);
router.get("/getStatus", authenticateToken, getStatus);
router.get("/getPriorities", authenticateToken, getPriorities);

module.exports = router;
