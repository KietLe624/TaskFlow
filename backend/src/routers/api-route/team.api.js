const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const { authenticateToken } = require("../../middleware/auth.middleware");

// Middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cors());

// Import controller project
const {
  createTeam,
  updateTeam,
  deleteTeam,
  getAllTeamsByOwner,
  getTeamMembers,
  inviteMember,
  removeMember,
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

module.exports = router;
