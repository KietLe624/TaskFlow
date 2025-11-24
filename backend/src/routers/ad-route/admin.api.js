const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  isAdmin,
  loadUserWithRoles,
} = require("../../middleware/auth.middleware");

// Import admin controller
const {
  getStats,
  adminResetPassword,
} = require("../../controllers/admin.controller");

// Import user controller
const {
  changeUserRole,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../../controllers/user.controller");

// import project controller
const {
  getAllProjects,
  updateProject,
  deleteProject,
} = require("../../controllers/project.controller");
// import team controller
const {
  getAllTeams,
  createTeamAdmin,
  updateTeam,
  deleteTeam,
  inviteMember,
  removeMember,
} = require("../../controllers/team.controller");

// ======================================================================

// dashboard routes
router.get("/dashboard", [authenticateToken, isAdmin], getStats);

// user routes
router.post("/user/createUser", [authenticateToken, isAdmin], createUser);
router.patch(
  "/user/changeUserRole/:user_id",
  [authenticateToken, isAdmin],
  changeUserRole
);
router.get("/user/getAllUsers", [authenticateToken, isAdmin], getAllUsers);
router.patch(
  "/user/updateUser/:user_id",
  [authenticateToken, isAdmin],
  updateUser
);
router.patch(
  "/user/reset-password/:userId",
  [authenticateToken, isAdmin],
  adminResetPassword
);
router.delete(
  "/user/deleteUser/:user_id",
  [authenticateToken, isAdmin],
  deleteUser
);

// project routes
router.get(
  "/project/getAllProjects",
  [authenticateToken, isAdmin],
  getAllProjects
);
router.patch(
  "/project/updateProject/:project_id",
  [authenticateToken, isAdmin],
  updateProject
);
router.delete(
  "/project/deleteProject/:project_id",
  [authenticateToken, isAdmin],
  deleteProject
);

// team routes
router.get("/team/getAllTeams", [authenticateToken, isAdmin], getAllTeams);
router.post(
  "/team/createTeamAdmin",
  [authenticateToken, isAdmin],
  createTeamAdmin
);

router.patch(
  "/team/updateTeam/:team_id",
  [authenticateToken, isAdmin],
  updateTeam
);

router.delete(
  "/team/deleteTeam/:team_id",
  [authenticateToken, isAdmin],
  deleteTeam
);

router.post(
  "/team/inviteMember/:team_id",
  [authenticateToken, isAdmin],
  inviteMember
);

router.delete(
  "/removeMember",
  [authenticateToken, isAdmin, loadUserWithRoles],
  removeMember
);

module.exports = router;
