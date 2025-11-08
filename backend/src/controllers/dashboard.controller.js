const { getDashboardData } = require("../services/dashboard.service");

const getDashboards = async (req, res) => {
  try {
    const userId = req.user?.user_id ?? req.user?.dataValues?.user_id;
    if (!userId)
      return res.status(401).json({ message: "Unauthorized: missing user_id" });

    const data = await getDashboardData(userId);
    return res.json(data);
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu dashboard:", err);
    return res
      .status(500)
      .json({
        message: err?.message || "Không thể lấy dữ liệu dashboard",
        stack: err?.stack,
      });
  }
};

module.exports = { getDashboards };
