const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");

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
  getProjectById,
} = require("../../controllers/project.controller");

// Define routes

router.get("/getAllProjects", getAllProjects);
router.post("/createProjects", createProject);
router.patch("/updateProject/:project_id", updateProject);
router.delete("/deleteProject/:project_id", deleteProject);





module.exports = router;