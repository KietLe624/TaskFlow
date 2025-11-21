const express = require("express");
const router = express.Router();
const {
  createManual,
  getMyNotifications,
  getUnreadCount,
  markAllRead,
  markOneAsRead,
} = require("../../controllers/notification.controller");

// Import middleware xác thực (bạn nhớ thay đường dẫn đúng với dự án của bạn)
// Middleware này quan trọng để có được req.user.user_id trong controller
const { authenticateToken } = require("../../middleware/auth.middleware");

// --- Định nghĩa các Routes ---

// 1. Tạo thông báo mới (POST /api/notifications)
// Thường dùng cho Admin hoặc các service khác gọi vào
router.post("/createNotification", authenticateToken, createManual);
// 2. Lấy danh sách thông báo của user (GET /api/notifications?page=1&limit=10)
router.get("/getNotifications", authenticateToken, getMyNotifications);

// 3. Lấy số lượng chưa đọc (GET /api/notifications/unread-count)
// Đặt route này TRƯỚC route /:id để tránh nhầm lẫn "unread-count" là một id
router.get("/unreadCount", authenticateToken, getUnreadCount);

// 4. Đánh dấu tất cả là đã đọc (PATCH /api/notifications/read-all)
router.patch("/readAll", authenticateToken, markAllRead);

// 5. Đánh dấu 1 thông báo là đã đọc (PATCH /api/notifications/:id/read)
router.patch("/:id/read", authenticateToken, markOneAsRead);

module.exports = router;
