const db = require("../models/index.model");
const { User, Project, Task, Team } = db;

// Create a new task
const createTask = async (taskData) => {
  // Kiểm tra tham số đầu vào
  const {
    task_name,
    project_id,
    parent_id,
    description,
    status,
    priority,
    start_date,
    due_date,
    created_by,
  } = taskData;
  if (
    !task_name ||
    !status ||
    !priority ||
    !start_date ||
    !due_date ||
    !created_by
  ) {
    throw new Error("Thiếu thông tin bắt buộc");
  }

  console.log("🧩 taskData nhận được:", taskData);
  const task = await Task.create(taskData);
  return task;
};
// Get all tasks
const getAllTasks = async () => {
  const tasks = await Task.findAll();
  return tasks;
};
// Get a task by ID
const getTaskById = async (taskId) => {
  const task = await Task.findByPk(taskId);
  return task;
};
// Update a task
const updateTask = async (taskId, updatedData) => {
  const task = await Task.findByPk(taskId);
  if (!task) {
    throw new Error("Task not found");
  }
  await task.update(updatedData);
  return task;
};
// Delete a task
const deleteTask = async (taskId) => {
  const task = await Task.findByPk(taskId);
  if (!task) {
    throw new Error("Task not found");
  }
  await task.destroy();
  return;
};
// Get tasks by project ID
const getTasksByProjectId = async (projectId) => {
  const tasks = await Task.findAll({ where: { projectId } });
  return tasks;
};
// Get tasks by user ID
const getTasksByUserId = async (userId) => {
  const tasks = await Task.findAll({ where: { assignedTo: userId } });
  return tasks;
};
// Get tasks by team ID
const getTasksByTeamId = async (teamId) => {
  const tasks = await Task.findAll({ where: { teamId } });
  return tasks;
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByProjectId,
  getTasksByUserId,
  getTasksByTeamId,
};
