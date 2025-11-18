const db = require("../models/index.model");
const { get } = require("../routers/api-route/project.api"); 
const { sequelize, User, Project, Task, Activity, TaskComment } = db;
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
      assignee_ids = [], // ← frontend gửi mảng [3,7,12]
    } = taskData;

    // Tạo task trước
    const task = await Task.create(
      {
        task_name,
        project_id: project_id || null,
        parent_id: parent_id || null,
        description: description || "",
        status: status || "to_do",
        priority: priority || "medium",
        start_date,
        due_date,
        created_by: user_id,
      },
      { transaction: t }
    );

    if (assignee_ids.length > 0) {
      const records = assignee_ids.map((user_id) => ({
        task_id: task.task_id,
        user_id: user_id,
        assigned_by: user_id, // người tạo task giao việc
        assigned_at: new Date(),
      }));
      await sequelize.models.TaskAssignees.bulkCreate(records, {
        transaction: t,
      });
    }

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
    return task;
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
const updateTask = async (taskId, updatedData, current_user_id = null) => {
  const t = await sequelize.transaction();
  try {
    const task = await Task.findByPk(taskId, { transaction: t });
    if (!task) throw new Error("Task not found");

    const { assignee_ids, ...taskFields } = updatedData;

    await task.update(taskFields, { transaction: t });

    // CẬP NHẬT ASSIGNEES
    if (assignee_ids !== undefined) {
      await sequelize.models.TaskAssignees.destroy({
        where: { task_id: taskId },
        transaction: t,
      });

      if (assignee_ids.length > 0) {
        const records = assignee_ids.map((user_id) => ({
          task_id: taskId,
          user_id,
          assigned_by: current_user_id || task.created_by,
          assigned_at: new Date(),
        }));
        await sequelize.models.TaskAssignees.bulkCreate(records, {
          transaction: t,
        });
      }
    }

    await t.commit();
    return task;
  } catch (err) {
    await t.rollback();
    throw err;
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
    where: {
      [Op.or]: [{ created_by: userId }, { "$assignees.user_id$": userId }],
    },
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

// Thêm comment
const addComment = async (taskId, user_id, content) => {
  const comment = await sequelize.models.TaskComment.create({
    task_id: taskId,
    user_id,
    content,
  });

  // Trả về comment + info user để frontend hiển thị luôn
  return await sequelize.models.TaskComment.findByPk(comment.cmt_id, {
    include: [
      {
        model: sequelize.models.User,
        as: "author",
        attributes: ["user_id", "username", "avatar_url"],
      },
    ],
  });
};

// Lấy tất cả comment của task
const getCommentsByTaskId = async (taskId) => {
  if (!taskId) {
    throw new Error("taskId là bắt buộc!");
  }
  return await sequelize.models.TaskComment.findAll({
    where: { task_id: taskId },
    order: [["created_at", "ASC"]],
    include: [
      {
        model: sequelize.models.User,
        as: "author",
        attributes: ["user_id", "username", "avatar_url"],
      },
    ],
  });
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
  addComment,
  getCommentsByTaskId,
};
