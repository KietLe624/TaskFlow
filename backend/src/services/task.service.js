const db = require("../models/index.model");
const { get } = require("../routers/api-route/project.api");
const { sequelize, User, Project, Task, Activity } = db;
const { logActivity } = require("./activity.service");
const { Op } = require("sequelize");

//  CREATE TASK
const createTask = async (taskData, user_id) => {
  const t = await sequelize.transaction();
  try {
    const {
      task_name,
      project_id,
      parent_id,
      description,
      status,
      priority,
      start_date,
      due_date,
    } = taskData;

    // Validate project (nếu được truyền)
    if (project_id) {
      const project = await Project.findByPk(project_id, { transaction: t });
      if (!project) throw new Error("Project không tồn tại");
    }

    // Tạo task
    const task = await Task.create(
      {
        task_name,
        project_id: project_id || null,
        parent_id: parent_id || null,
        description: description || "",
        status,
        priority,
        start_date,
        due_date,
        created_by: user_id,
      },
      { transaction: t }
    );
    await logActivity(
      {
        user_id: user_id,
        entity_type: "task",
        entity_id: task.task_id,
        action: "created",
        description: `Tạo công việc: ${task.task_name}`,
      },
      t
    );

    await t.commit();
    return task; // hoặc: task.get({ plain: true })
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

//  GET ALL TASKS
const getAllTasks = async () => {
  return await Task.findAll();
};

//  GET TASK BY ID
const getTaskById = async (taskId) => {
  return await Task.findByPk(taskId, {
    include: [
      { model: Project, as: "project" },
      {
        model: User,
        as: "creator",
        attributes: ["user_id", "username", "email"],
      },
      {
        model: User,
        as: "assignees",
        attributes: ["user_id", "username", "email"],
        through: { attributes: [] },
      },
    ],
  });
};

//  UPDATE TASK
const updateTask = async (taskId, updatedData) => {
  try {
    const task = await Task.findByPk(taskId);
    if (!task) {
      throw new Error("Không tìm thấy task");
    }
    await task.update(updatedData, { fields: Object.keys(updatedData) });
    const newProjectProgress = await processTasks({
      project_id: task.project_id,
    });
    await Project.update(
      { progressPercent: newProjectProgress },
      { where: { id: task.project_id } }
    );
    return task;
  } catch (error) {
    console.error("Lỗi khi cập nhật task:", error);
    throw new Error("Cập nhật task thất bại: " + error.message);
  }
};

//  DELETE TASK
const deleteTask = async (taskId) => {
  const task = await Task.findByPk(taskId);
  if (!task) throw new Error("Không tìm thấy task");

  await task.destroy();
  return true;
};

//  GET TASKS BY USER
const getTasksByUserId = async (userId) => {
  return await Task.findAll({
    where: { created_by: userId },
    include: [
      { model: Project, as: "project" },
      {
        model: User,
        as: "creator",
        attributes: ["user_id", "username", "email"],
      },
      {
        model: User,
        as: "assignees",
        attributes: ["user_id", "username", "email"],
        through: { attributes: [] },
      },
    ],
  });
};

// get task by project id
const getTasksByProjectId = async (projectId) => {
  return await Task.findAll({
    where: { project_id: projectId },
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["user_id", "username", "email"],
      },
      {
        model: User,
        as: "assignees",
        attributes: ["user_id", "username", "email"],
        through: { attributes: [] },
      },
    ],
  });
};

const getStatus = async () => {
  try {
    const statuses = await Task.rawAttributes.status.values;
    return statuses;
  } catch (error) {
    console.error("Lỗi lấy trạng công việc (Service):", error);
    throw error;
  }
};

const getPriorities = async () => {
  try {
    const priorities = await Task.rawAttributes.priority.values;
    return priorities;
  } catch (error) {
    console.error("Lỗi lấy mức độ ưu tiên (Service): ", error);
    throw error;
  }
};

const processTasks = async (whereClause) => {
  try {
    const totalTasks = await Task.count({ where: whereClause });

    if (totalTasks === 0) return 0;

    const completedTasks = await Task.count({
      where: {
        ...whereClause,
        status: {
          [Op.or]: ["completed"],
        },
      },
    });
    const progress = (completedTasks / totalTasks) * 100;
    return Math.round(progress);
  } catch (error) {
    console.error("Lỗi khi tính progress:", error);
    return 0;
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByUserId,
  getTasksByProjectId,
  getStatus,
  getPriorities,
  processTasks,
};
