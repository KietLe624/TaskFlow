const dashboardService = require("../services/dashboard.service");

const getDashboards = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const data = await dashboardService.getDashboardData(userId);
    res.status(200).json(data);
  } catch (error) {
    console.error(" Lỗi khi lấy dữ liệu dashboard:", error);
    res.status(500).json({
      message: error.message || "Lỗi máy chủ khi lấy dữ liệu dashboard",
    });
  }
};

const getOverview = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const data = await getTaskOverviewCounts(userId, {
      newDays: 7,
      nearDays: 3,
    });
    res.json(data);
  } catch (err) {
    console.error(" Dashboard error:", err);
    res.status(500).json({ message: "Không thể tải dữ liệu dashboard" });
  }
};

module.exports = { getDashboards, getOverview };
