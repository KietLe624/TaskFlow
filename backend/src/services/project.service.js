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
const updateProject = async (projectId, userId, projectData) => {
  try {
    const updateProject = await Project.findByPk(projectId);
    if (!updateProject) {
      return null; // Project not found
    }

    if (updateProject.owner_id !== userId) {
      throw new Error("Bạn không có quyền cập nhật dự án này");
    }
    // Update project fields
    const updatedProject = await updateProject.update(projectData);
    return updatedProject;
  } catch (error) {
    console.error("Lỗi cập nhật dự án(Service):", error);
    throw error;
  }
};

// delete projects
const deleteProject = async (projectId, userId) => {
  try {
    const deletedProject = await Project.findByPk(projectId);
    if (!deletedProject) {
      return null; // Project not found
    }
    if (deletedProject.owner_id !== userId) {
      throw new Error("Bạn không có quyền xoá dự án này");
    }
    await deletedProject.destroy();
    return {
      message: "Dự án đã được xóa thành công",
      projectId: [projectId, deletedProject.project_name],
    };
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

// get projects by user id
const getProjectsByUserId = async (userId) => {
  try {
    const projects = await Project.findAll({
      where: { owner_id: userId },
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
    });
    return projects;
  } catch (error) {
    console.error("Lỗi lấy dự án theo user_id (Service):", error);
    throw error;
  }
};

module.exports = {
  createProject,
  updateProject,
  deleteProject,
  getAllProjects,
  getProjectsByUserId,
};
