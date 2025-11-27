const notificationService = require("../services/notification.service");

// 1. Lấy danh sách thông báo (GET /api/notifications)
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id; // Lấy từ middleware xác thực
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;
    if (limit > 50) limit = 50; // Giới hạn max 50 để tránh quá tải
    const result = await notificationService.getNotificationsByUserId(
      userId,
      page,
      limit
    );

    // Trả về đúng format Frontend mong đợi: { data: [], pagination: {} }
    return res.status(200).json({
      message: "Lấy danh sách thông báo thành công",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách thông báo",
      error: error.message,
    });
  }
};

// 2. Lấy số lượng chưa đọc (GET /api/notifications/unread-count)
// Dùng để hiển thị chấm đỏ trên quả chuông
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const result = await notificationService.getUnreadCountByUserId(userId);

    return res.status(200).json({
      message: "Thành công",
      data: result, // { unread_count: 5 }
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// 3. Đánh dấu 1 thông báo là đã đọc (PATCH /api/notifications/:id/read)
const markOneAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const notiId = req.params.id; // Lấy id từ URL

    const isUpdated = await notificationService.markAsRead(notiId, userId);

    if (!isUpdated) {
      // Có thể thông báo không tồn tại hoặc đã đọc rồi
      return res.status(400).json({
        message: "Không thể đánh dấu đã đọc (ID không tồn tại hoặc lỗi)",
      });
    }

    return res.status(200).json({
      message: "Đã đánh dấu là đã đọc",
    });
  } catch (error) {
    console.error("Mark read error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// 4. Đánh dấu tất cả là đã đọc (PATCH /api/notifications/read-all)
const markAllRead = async (req, res) => {
  try {
    const userId = req.user.user_id;
    await notificationService.markAllAsRead(userId);

    return res.status(200).json({
      message: "Đã đánh dấu tất cả là đã đọc",
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// 5. (Optional) Tạo thông báo thủ công (POST /api/notifications)
const createManual = async (req, res) => {
  try {
    // Dữ liệu từ body: { user_id, title, content, type... }
    const notiData = req.body;

    // Gọi service tạo (không cần log activity ở đây vì service đã sạch)
    const newNoti = await notificationService.createNotification(notiData);

    return res.status(201).json({
      message: "Tạo thông báo thành công",
      data: newNoti,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return res.status(500).json({ message: "Lỗi tạo thông báo" });
  }
};

// chi tiết notification
const getNotificationDetail = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const notiId = req.params.id;

    const noti = await notificationService.getNotificationById(notiId, userId);

    if (!noti) {
      return res.status(404).json({
        message: "Thông báo không tồn tại hoặc bạn không có quyền xem",
      });
    }

    return res.status(200).json(noti);
  } catch (error) {
    console.error("Get notification detail error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// xoá notification
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const notiId = req.params.id;

    const isDeleted = await notificationService.deleteNotification(
      notiId,
      userId
    );

    if (!isDeleted) {
      return res.status(404).json({
        message: "Không tìm thấy thông báo để xóa",
      });
    }

    return res.status(200).json({
      message: "Đã xóa thông báo thành công",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markOneAsRead,
  markAllRead,
  createManual,
  getNotificationDetail,
  deleteNotification,
};
