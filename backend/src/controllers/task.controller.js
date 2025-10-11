const taskService = require("../services/task.service");

// Create a new task
const createTask = async (req, res) => {
  // Lấy userId từ token
  const userId = req.user.user_id;
  try {
    const task = await taskService.createTask({ ...req.body, userId });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get all tasks
const getAllTasks = async (req, res) => {
  // Lấy userId từ token
//   const userId = req.user.user_id;
  try {
    const tasks = await taskService.getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTask,
  getAllTasks,
};
