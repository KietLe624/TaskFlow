const e = require("express");
const db = require("../models/index.model");
const { User, Project, Task, Team } = db;

// Create a new project
const createProject = async (projectData) => {
  try {
    const {
      project_name,
      owner_id,
      team_id,
      description,
      status,
      start_date,
      due_date,
    } = projectData;
    const newProject = await Project.create({
      project_name,
      owner_id,
      team_id: team_id || null,
      description: description || "",
      status,
      start_date,
      due_date,
    });
    return newProject;
  } catch (error) {
    console.error("Lỗi tạo dự án(Service):", error);
    throw error;
  }
};

// Update a project
const updateProject = async (projectId, projectData) => {
  try {
    const project = await Project.findByPk(projectId);
    if (!project) {
      return null; // Project not found
    }
    // Update project fields
    const updatedProject = await project.update(projectData);
    return updatedProject;
  } catch (error) {
    console.error("Lỗi cập nhật dự án(Service):", error);
    throw error;
  }
};

// delete projects
const deleteProject = async (projectId) => {
  try {
    const project = await Project.findByPk(projectId);
    if (!project) {
      return null; // Project not found
    }
    await project.destroy();
    return project;
  } catch (error) {
    console.error("Lỗi xóa dự án(Service):", error);
    throw error;
  }
};

// Get all projects
const getAllProjects = async () => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: db.User,
          as: "owner",
          attributes: ["user_id", "username", "email", "full_name"],
        },
        {
          model: db.Team,
          as: "team",
          attributes: ["team_id", "team_name"],
        },
        {
          model: db.Task,
          as: "tasks",
          attributes: [
            "task_id",
            "task_name",
            "status",
            "priority",
            "start_date",
            "due_date",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return projects;
  } catch (error) {
    console.error("Lỗi lấy danh sách dự án (Service):", error);
    throw error;
  }
};

module.exports = {
  createProject,
  updateProject,
  deleteProject,
  getAllProjects,
};
