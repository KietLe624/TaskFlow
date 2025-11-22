const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../middleware/auth.middleware");

// Import controller project
const {
  createTeam,
  updateTeam,
  deleteTeam,
  getAllTeamsByOwner,
  getTeamMembers,
  getTeamOverview,
  getTeamProjects,
  inviteMember,
  removeMember,
  changeMemberRole,
} = require("../../controllers/team.controller");

// Routes
router.post("/createTeam", authenticateToken, createTeam);
router.patch("/updateTeam/:team_id", authenticateToken, updateTeam);
router.delete("/deleteTeam/:team_id", authenticateToken, deleteTeam);
router.get(
  "/getAllTeamsByOwner/:user_id",
  authenticateToken,
  getAllTeamsByOwner
);
router.get("/getTeamMembers/:team_id", authenticateToken, getTeamMembers);
router.post("/inviteMember", authenticateToken, inviteMember);
router.delete("/removeMember", authenticateToken, removeMember);

router.get("/getTeamOverview/:team_id", authenticateToken, getTeamOverview);
router.get("/getTeamProjects/:team_id", authenticateToken, getTeamProjects);
router.patch("/changeMemberRole", authenticateToken, changeMemberRole);

module.exports = router;
