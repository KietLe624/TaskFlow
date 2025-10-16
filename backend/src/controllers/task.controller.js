const taskService = require("../services/task.service");

// create task
const createTask = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    const { task_name, status, priority, start_date, due_date } = req.body;

    //  Validation cơ bản tại Controller (input validation)
    if (!task_name || !status || !priority || !start_date || !due_date) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const task = await taskService.createTask(req.body, userId);
    res.status(201).json({
      message: "Tạo task thành công",
      task,
    });
  } catch (error) {
    console.error("Lỗi khi tạo task:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all task
const getAllTasks = async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

  // get task by user id
  const getTasksByUserId = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    const tasks = await taskService.getTasksByUserId(userId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error("❌ Lỗi khi lấy task:", error);
    res.status(500).json({ message: error.message });
  }
};

// get task by id
const getTaskById = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    const taskId = req.params.task_id;
    const task = await taskService.getTaskById(taskId);

    if (!task) return res.status(404).json({ message: "Không tìm thấy task" });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update task 
const updateTask = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    const taskId = req.params.task_id;
    const updatedData = req.body;

    //  Validation đầu vào
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({ message: "Dữ liệu cập nhật không hợp lệ" });
    }

    const updatedTask = await taskService.updateTask(taskId, updatedData);
    res.status(200).json({
      message: "Cập nhật task thành công",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật task:", error);
    res.status(500).json({ message: error.message });
  }
};

// delete task
const deleteTask = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    const taskId = req.params.task_id;
    const result = await taskService.deleteTask(taskId);

    res.status(200).json({
      message: "Xóa task thành công",
      result,
    });
  } catch (error) {
    console.error("Lỗi khi xóa task:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasksByUserId,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
