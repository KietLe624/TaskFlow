const taskService = require("../services/task.service");

// create task
const createTask = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) return res.status(401).json({ message: "Chưa đăng nhập" });
    const { task_name, status, priority, start_date, due_date } = req.body;
    if (start_date && due_date) {
      const start = new Date(start_date);
      const end = new Date(due_date);
      if (end < start) {
        return res.status(400).json({
          message: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!",
        });
      }
    }

    //  Validation cơ bản tại Controller (input validation)
    if (!task_name || !status || !priority || !start_date || !due_date) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const task = await taskService.createTask(req.body, user_id);
    res.status(201).json({
      message: "Tạo task thành công",
      task,
    });
  } catch (error) {
    console.error("Lỗi khi tạo task:", error);
    res.status(500).json({ message: error.message });
  }
};

// create task admin
const createTaskAdmin = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    if (!user_id) return res.status(401).json({ message: "Chưa đăng nhập" });
    const { task_name, status, priority, start_date, due_date } = req.body;
    //  Validation cơ bản tại Controller (input validation)
    if (!task_name || !status || !priority || !start_date || !due_date) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    const task = await taskService.createTask(req.body, user_id);
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
    res.status(200).json({ message: "Lấy task thành công", tasks });
  } catch (error) {
    console.error(" Lỗi khi lấy task:", error);
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

// get tasks by project id
const getTasksByProjectId = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });
    const projectId = req.params.project_id;
    const tasks = await taskService.getTasksByProjectId(projectId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error(" Lỗi khi lấy task:", error);
    res.status(500).json({ message: error.message });
  }
};

const getStatus = async (req, res) => {
  try {
    const statuses = await taskService.getStatus();
    res.status(200).json({ message: "Lấy trạng thái thành công", statuses });
  } catch (error) {
    console.error("Lỗi khi lấy trạng thái:", error);
    res.status(500).json({ message: error.message });
  }
};

const getPriorities = async (req, res) => {
  try {
    const priorities = await taskService.getPriorities();
    res
      .status(200)
      .json({ message: "Lấy mức độ ưu tiên thành công", priorities });
  } catch (error) {
    console.error("Lỗi khi lấy mức độ ưu tiên:", error);
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const taskId = req.params.task_id;
    if (!taskId || taskId === "undefined" || taskId === "null") {
      return res.status(400).json({ error: "taskId không hợp lệ" });
    }
    const { content } = req.body;
    const user_id = req.user.user_id; // từ auth middleware

    if (!content?.trim()) {
      return res
        .status(400)
        .json({ error: "Nội dung bình luận không được để trống" });
    }

    const comment = await taskService.addComment(
      taskId,
      user_id,
      content.trim()
    );

    return res.status(201).json({
      message: "Thêm bình luận thành công",
      comment,
    });
  } catch (error) {
    console.error("Lỗi thêm comment:", error);
    return res.status(500).json({ error: "Thêm bình luận thất bại" });
  }
};

const getComments = async (req, res) => {
  try {
    const taskId = req.params.task_id;

    if (!taskId || taskId === "undefined" || taskId === "null") {
      return res.status(400).json({ error: "taskId không hợp lệ" });
    }
    const comments = await taskService.getCommentsByTaskId(taskId);

    return res.json({
      message: "Lấy bình luận thành công",
      comments,
    });
  } catch (error) {
    console.error("Lỗi lấy comment:", error);
    return res.status(500).json({ error: "Lấy bình luận thất bại" });
  }
};

// search tasks
const searchTasks = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    // Lấy các tham số từ URL (VD: ?keyword=abc&status=to_do)
    const filters = req.query;

    const tasks = await taskService.searchTasks(userId, filters);

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Lỗi tìm kiếm task:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  createTaskAdmin,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByUserId,
  getTasksByProjectId,
  getStatus,
  getPriorities,
  addComment,
  getComments,
  searchTasks,
};
