const notificationService = require("../services/notification.service");

const createNotification = async (req, res) => {
  try {
    // Lấy dữ liệu từ body request
    const notiData = req.body;

    // Gọi service
    const newNotification = await notificationService.createNotification(
      notiData
    );

    return res.status(201).json({
      message: "Tạo thông báo thành công",
      data: newNotification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return res.status(500).json({
      message: "Lỗi khi tạo thông báo",
      error: error.message,
    });
  }
};

// 2. Lấy danh sách thông báo của user đang đăng nhập
const getMyNotifications = async (req, res) => {
  try {
    // Giả định: req.user.user_id được lấy từ token xác thực
    const userId = req.user.user_id;

    // Lấy tham số phân trang từ query params (?page=1&limit=20)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await notificationService.getNotificationsByUserId(
      userId,
      page,
      limit
    );

    return res.status(200).json({
      message: "Lấy danh sách thông báo thành công",
      data: result.notifications,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách thông báo",
      error: error.message,
    });
  }
};

// 3. Lấy số lượng thông báo chưa đọc
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await notificationService.getUnreadCountByUserId(userId);

    return res.status(200).json({
      message: "Lấy số lượng thông báo chưa đọc thành công",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// 4. Đánh dấu một thông báo cụ thể là đã đọc
const markOneAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { id } = req.params; // Lấy noti_id từ URL (VD: /notifications/:id/read)

    const isUpdated = await notificationService.markAsRead(id, userId);

    if (!isUpdated) {
      return res.status(404).json({
        message: "Không tìm thấy thông báo hoặc thông báo đã được đọc",
      });
    }

    return res.status(200).json({
      message: "Đánh dấu đã đọc thành công",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// 5. Đánh dấu tất cả là đã đọc
const markAllRead = async (req, res) => {
  try {
    const userId = req.user.user_id;

    await notificationService.markAllAsRead(userId);

    return res.status(200).json({
      message: "Đã đánh dấu tất cả là đã đọc",
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  getUnreadCount,
  markOneAsRead,
  markAllRead,
};
