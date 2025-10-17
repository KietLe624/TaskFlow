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
