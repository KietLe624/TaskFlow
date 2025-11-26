const adminService = require("../services/admin.service");
const authService = require("../services/auth.service");
const projectService = require("../services/project.service");

const getStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error("Admin getStats error:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const adminResetPassword = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "User ID không hợp lệ" });
    }

    const result = await authService.resetPasswordForAdmin(Number(userId));
    res.json(result);
  } catch (error) {
    console.error("Admin reset password error:", error);
    res.status(400).json({ message: error.message });
  }
};

const createProjectByAdmin = async (req, res) => {
  try {
    const projectData = req.body;
    const adminUser = req.user; // Admin đang đăng nhập
    const newProject = await projectService.createProject(
      projectData,
      adminUser
    );

    res.status(201).json({
      message: "Tạo project thành công",
      project: newProject,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getStats,
  adminResetPassword,
  createProjectByAdmin,
};
