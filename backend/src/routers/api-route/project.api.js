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
  getProjectMembers,
  inviteMemberToProject,
} = require("../../controllers/project.controller");

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
router.get(
  "/getProjectMembers/:project_id",
  authenticateToken,
  getProjectMembers
);
router.post(
  "/inviteMemberToProject/:project_id",
  authenticateToken,
  inviteMemberToProject
);

module.exports = router;
