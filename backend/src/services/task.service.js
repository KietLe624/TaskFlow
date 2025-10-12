const db = require("../models/index.model");
const { User, Project, Task } = db;

//  CREATE TASK
const createTask = async (taskData, userId) => {
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

  //  Kiểm tra nghiệp vụ (business validation)
  if (project_id) {
    const project = await Project.findByPk(project_id);
    if (!project) throw new Error("Project không tồn tại");
  }

  const newTaskData = {
    task_name,
    project_id: project_id || null,
    parent_id: parent_id || null,
    description: description || "",
    status,
    priority,
    start_date,
    due_date,
    created_by: userId,
  };

  const task = await Task.create(newTaskData);
  return task;
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
  const task = await Task.findByPk(taskId);
  if (!task) throw new Error("Không tìm thấy task");

  await task.update(updatedData);
  return task;
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

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByUserId,
};
