const activityService = require("../services/activity.service");

const getActivities = async (req, res) => {
  try {
    const { page, limit, type, action, search } = req.query;

    const result = await activityService.getAllActivities({
      page,
      limit,
      type,
      action,
      search,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách hoạt động thành công",
      data: result.data,
      meta: result.meta, // Gửi kèm thông tin phân trang
    });
  } catch (error) {
    console.error("Activity Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ",
    });
  }
};

module.exports = {
  getActivities,
};
