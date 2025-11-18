const db = require("../models/index.model");
const { sequelize, Notification, User } = db;
const { logActivity } = require("./activity.service");

const createNotification = async (notiData) => {
  const t = await sequelize.transaction();
  try {
    const {
      user_id,
      type,
      title,
      noti_content = null,
      entity_type,
      entity_id = null,
    } = notiData;

    const notification = await Notification.create(
      {
        user_id,
        type,
        title,
        noti_content,
        entity_type,
        entity_id,
        is_read: false,
        created_at: new Date(),
      },
      { transaction: t }
    );

    // Ghi activity (tùy chọn – rất hay để trace)
    await logActivity(
      {
        user_id: user_id, // hoặc actor_id nếu có
        entity_type: "notification",
        entity_id: notification.noti_id,
        action: "created",
        description: `Thông báo: ${title}`,
      },
      t
    );

    await t.commit();
    return notification;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const getNotificationsByUserId = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await Notification.findAndCountAll({
    where: { user_id: userId },
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });

  return {
    notifications: rows,
    pagination: {
      total: count,
      page,
      total_pages: Math.ceil(count / limit),
      has_more: count > page * limit,
    },
  };
};

const getUnreadCountByUserId = async (userId) => {
  const count = await Notification.count({
    where: {
      user_id: userId,
      is_read: false,
    },
  });
  return { unread_count: count };
};

const markAsRead = async (notiId, userId) => {
  const result = await Notification.update(
    { is_read: true, read_at: new Date() },
    {
      where: {
        noti_id: notiId,
        user_id: userId,
      },
    }
  );
  return result[0] > 0; // true nếu có cập nhật
};

const markAllAsRead = async (userId) => {
  await Notification.update(
    { is_read: true, read_at: new Date() },
    {
      where: {
        user_id: userId,
        is_read: false,
      },
    }
  );
  return true;
};

module.exports = {
  createNotification,
  getNotificationsByUserId,
  getUnreadCountByUserId,
  markAsRead,
  markAllAsRead,
};
