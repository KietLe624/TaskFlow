const adminService = require("../services/admin.service");
const authService = require("../services/auth.service");

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

module.exports = {
  getStats,
  adminResetPassword,
};
