const e = require("express");
const db = require("../models/index.model");
const { Op, Transaction } = require("sequelize");
const { User, Project, Task, Team } = db;
const { logActivity } = require("./activity.service");

// Create a new project
const createProject = async (projectData, user) => {
  const t = await db.sequelize.transaction();
  try {
    console.log("📥 Dữ liệu nhận từ controller:", projectData);
    console.log("👤 Thông tin user từ controller:", user);

    const {
      project_name,
      team_id,
      description,
      status,
      start_date,
      due_date,
      client,
      budget,
      priority,
    } = projectData;

    //  Validate input
    if (!project_name || !start_date || !due_date) {
      throw new Error(
        "Thiếu thông tin bắt buộc: project_name, start_date hoặc due_date"
      );
    }

    const owner_id = user?.user_id;
    if (!owner_id) {
      throw new Error("Không tìm thấy thông tin người tạo (owner_id)");
    }

    //  Tạo dự án mới
    const newProject = await Project.create(
      {
        project_name,
        owner_id,
        team_id: team_id || null,
        description: description || "",
        status: status || "to_do",
        start_date,
        due_date,
        client: client || null,
        budget: budget || 0,
        priority: priority || "medium",
      },
      { transaction: t }
    );

    await logActivity({
      userId: owner_id,
      entityType: "project",
      entityId: newProject.project_id,
      action: "created",
      description: `Tạo dự án: ${newProject.project_name}`,
      tx: t,
    });

    await t.commit();
    return newProject;
  } catch (error) {
    await t.rollback();
    console.error(" Lỗi tạo dự án (Service):", error.message);
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
      where: {
        [Op.or]: [
          { owner_id: userId }, // 1. User là chủ sở hữu
          { "$members.user_id$": userId }, // 2. User là thành viên (tham gia)
        ],
      },
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
        {
          // Include này BẮT BUỘC phải có
          // để điều kiện '$members.user_id$' hoạt động
          model: db.User,
          as: "members", // (Giả định bro đặt tên association là 'members')
          attributes: ["user_id", "username", "avatar_url"], // Trả về members luôn
          through: { attributes: [] }, // Không cần thông tin từ bảng trung gian
        },
      ],
      order: [["created_at", "DESC"]],
      // Thêm 'distinct: true' để tránh bị trùng lặp dự án
      // (nếu user vừa là owner vừa là member)
      distinct: true,
    });
    return processProjects(projects);
  } catch (error) {
    console.error("Lỗi lấy dự án theo user_id (Service):", error);
    throw error;
  }
};

// get status
const getStatus = async () => {
  try {
    const statuses = await Project.rawAttributes.status.values;
    return statuses;
  } catch (error) {
    console.error("Lỗi lấy trạng thái dự án (Service):", error);
    throw error;
  }
};

// get priorities
const getPriorities = async () => {
  try {
    const priorities = await Task.rawAttributes.priority.values;
    return priorities;
  } catch (error) {
    console.error("Lỗi lấy mức độ ưu tiên (Service):", error);
    throw error;
  }
};

const getProjectById = async (projectId, userId) => {
  try {
    const project = await Project.findOne({
      where: {
        project_id: projectId,
        owner_id: userId,
      },
      include: [
        {
          model: db.User,
          as: "owner", // Người sở hữu dự án
          attributes: ["user_id", "username", "email", "full_name"],
        },
        {
          model: db.Team,
          as: "team", // Team được gán
          attributes: ["team_id", "team_name"],
        },
        {
          model: db.User,
          as: "members",
          attributes: ["user_id", "username", "avatar_url", "full_name"],
          through: { attributes: [] }, // Bỏ qua dữ liệu của bảng trung gian
        },
        {
          model: db.Task,
          as: "tasks", // Lấy các task liên quan
          attributes: [
            "task_id",
            "task_name",
            "status",
            "priority",
            "start_date",
            "due_date",
            "created_at",
            "updated_at",
          ],
          include: [
            {
              model: db.Attachment,
              as: "attachments", // Lấy các attachment của task
              attributes: ["attach_id", "file_name", "file_url"],
            },
          ],
        },
        {
          model: db.Activity,
          as: "activities", // Lấy các hoạt động liên quan đến dự án
          attributes: ["activity_id"],
        },
      ],
    });

    if (!project) {
      throw new Error("Không tìm thấy dự án hoặc bạn không có quyền truy cập.");
    }

    const projectData = project.toJSON();

    if (projectData.start_date) {
      projectData.start_date = new Date(projectData.start_date)
        .toISOString()
        .split("T")[0];
    }
    if (projectData.due_date) {
      projectData.due_date = new Date(projectData.due_date)
        .toISOString()
        .split("T")[0];
    }

    return processProjects([project])[0];
  } catch (error) {
    console.error("Lỗi lấy dự án theo project_id (Service):", error);
    throw error;
  }
};

const processProjects = (projects) => {
  if (!projects) return [];

  return projects.map((p) => {
    const project = p.toJSON();

    // 1. Đếm Tasks
    const taskCount = p.tasks ? p.tasks.length : 0;

    // 2. Đếm Attachments
    const attachmentCount = p.tasks
      ? p.tasks.reduce((sum, task) => {
          return sum + (task.attachments ? task.attachments.length : 0);
        }, 0)
      : 0;
    // 3. Đếm Activities
    const activityCount = p.activities ? p.activities.length : 0;

    // 4. Tính tiến độ dựa trên số task đã hoàn thành
    let progressPercent = 0;
    if (taskCount > 0) {
      const completedTasks = p.tasks.filter(
        (t) => t.status === "completed"
      ).length;
      progressPercent = Math.round((completedTasks / taskCount) * 100);
    }

    return {
      ...project,
      taskCount,
      attachmentCount,
      activityCount,
      progressPercent,
    };
  });
};

module.exports = {
  createProject,
  updateProject,
  deleteProject,
  getStatus,
  getPriorities,
  getAllProjects,
  getProjectsByUserId,
  getProjectById,
};
