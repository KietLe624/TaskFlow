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
  createProject,
  updateProject,
  deleteProject,
  adminDeleteProject,
  inviteMemberToProject,
} = require("../../controllers/project.controller");
// import team controller
const {
  getAllTeams,
  createTeamAdmin,
  updateTeam,
  deleteTeam,
  inviteMember,
  removeMember,
  removeMemberWithAdmin,
} = require("../../controllers/team.controller");
// import task controller
const { createTaskAdmin } = require("../../controllers/task.controller");
// import activity controller
const { getActivities } = require("../../controllers/activity.controller");

// ======================================================================

// dashboard routes
router.get(
  "/dashboard",
  [authenticateToken, loadUserWithRoles, isAdmin],
  getStats
);

// user routes
router.post(
  "/user/createUser",
  [authenticateToken, loadUserWithRoles, isAdmin],
  createUser
);

router.patch(
  "/user/changeUserRole/:user_id",
  [authenticateToken, loadUserWithRoles, isAdmin],
  changeUserRole
);

router.get(
  "/user/getAllUsers",
  [authenticateToken, loadUserWithRoles, isAdmin],
  getAllUsers
);

router.patch(
  "/user/updateUser/:user_id",
  [authenticateToken, loadUserWithRoles, isAdmin],
  updateUser
);

router.patch(
  "/user/reset-password/:userId",
  [authenticateToken, loadUserWithRoles, isAdmin],
  adminResetPassword
);

router.delete(
  "/user/deleteUser/:user_id",
  [authenticateToken, loadUserWithRoles, isAdmin],
  deleteUser
);

// project routes
router.get(
  "/project/getAllProjects",
  [authenticateToken, loadUserWithRoles, isAdmin],
  getAllProjects
);

router.post(
  "/project/createProject",
  [authenticateToken, loadUserWithRoles, isAdmin],
  createProject
);

router.patch(
  "/project/updateProject/:project_id",
  [authenticateToken, loadUserWithRoles, isAdmin],
  updateProject
);
// router.delete(
//   "/project/deleteProject/:project_id",
//   [authenticateToken, loadUserWithRoles, isAdmin],
//   deleteProject
// );

router.delete(
  "/project/adminDeleteProject/:project_id",
  [authenticateToken, loadUserWithRoles, isAdmin],
  adminDeleteProject
);

router.post(
  "/project/inviteMember/:project_id",
  [authenticateToken, loadUserWithRoles, isAdmin],
  inviteMemberToProject
);

// team routes
router.get(
  "/team/getAllTeams",
  [authenticateToken, loadUserWithRoles, isAdmin],
  getAllTeams
);
router.post(
  "/team/createTeamAdmin",
  [authenticateToken, loadUserWithRoles, isAdmin],
  createTeamAdmin
);

router.patch(
  "/team/updateTeam/:team_id",
  [authenticateToken, loadUserWithRoles, isAdmin],
  updateTeam
);

router.delete(
  "/team/deleteTeam/:team_id",
  [authenticateToken, loadUserWithRoles, isAdmin],
  deleteTeam
);

router.post(
  "/team/inviteMember/:team_id",
  [authenticateToken, loadUserWithRoles, isAdmin],
  inviteMember
);

router.delete(
  "/team/removeMemberWithAdmin/:team_id/member/:user_id",
  [authenticateToken, loadUserWithRoles, isAdmin],
  removeMemberWithAdmin
);

// create task by admin
router.post(
  "/task/createTaskAdmin",
  [authenticateToken, loadUserWithRoles, isAdmin],
  createTaskAdmin
);
// activity routes
router.get(
  "/activity/getActivities",
  [authenticateToken, loadUserWithRoles, isAdmin],
  getActivities
);

module.exports = router;
