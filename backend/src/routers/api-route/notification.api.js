const express = require("express");
const router = express.Router();
const {
  createManual,
  getMyNotifications,
  getUnreadCount,
  markAllRead,
  markOneAsRead,
  getNotificationDetail,
  deleteNotification,
} = require("../../controllers/notification.controller");

const { authenticateToken } = require("../../middleware/auth.middleware");

router.post("/createNotification", authenticateToken, createManual);
router.get("/getNotifications", authenticateToken, getMyNotifications);

router.get("/unreadCount", authenticateToken, getUnreadCount);
router.patch("/readAll", authenticateToken, markAllRead);
router.patch("/:id/read", authenticateToken, markOneAsRead);

router.get("/:id", authenticateToken, getNotificationDetail);

router.delete("/:id", authenticateToken, deleteNotification);

module.exports = router;
