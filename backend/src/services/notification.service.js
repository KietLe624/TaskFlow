const db = require("../models/index.model");
const { sequelize, Notification, User, Task, Project } = db;
// const { logActivity } = require("./activity.service"); // Bỏ dòng này nếu không dùng

const createNotification = async (notiData, transaction = null) => {
  const t = transaction;
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

    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
    throw err; // Ném lỗi để Controller biết mà Rollback
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
    data: rows,
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
    { where: { noti_id: notiId, user_id: userId } }
  );
  return result[0] > 0;
};

const markAllAsRead = async (userId) => {
  await Notification.update(
    { is_read: true, read_at: new Date() },
    { where: { user_id: userId, is_read: false } }
  );
  return true;
};

// --- HELPER FUNCTIONS ---

// 1. Gán Task
const notifyTaskAssignment = async (
  actorId,
  targetUserId,
  taskInfo,
  transaction = null
) => {
  if (parseInt(actorId) === parseInt(targetUserId)) return;
  if (!taskInfo) return; // Safety check

  // Bỏ try-catch để lỗi thì rollback transaction chuẩn
  const actor = await User.findByPk(actorId);
  const actorName = actor ? actor.full_name : "Ai đó";

  await createNotification(
    {
      user_id: targetUserId,
      type: "TASK_ASSIGN", // Sửa thành uppercase cho đồng bộ
      title: "Bạn được giao việc mới",
      noti_content: `${actorName} đã phân công công việc "${taskInfo.task_name}" cho bạn.`,
      entity_type: "task",
      entity_id: taskInfo.task_id,
    },
    transaction
  );
};

// 2. Hoàn thành Task
const notifyTaskCompletion = async (
  actorId,
  creatorId,
  taskInfo,
  transaction = null
) => {
  if (parseInt(actorId) === parseInt(creatorId)) return;
  if (!taskInfo) return;

  const actor = await User.findByPk(actorId);
  const actorName = actor ? actor.full_name : "Thành viên";

  await createNotification(
    {
      user_id: creatorId,
      type: "TASK_DONE",
      title: "Công việc hoàn thành",
      noti_content: `${actorName} đã hoàn thành công việc "${taskInfo.task_name}".`,
      entity_type: "task",
      entity_id: taskInfo.task_id,
    },
    transaction
  );
};

// 3. Mời vào Dự án
const notifyProjectInvite = async (
  actorId,
  targetUserId,
  projectInfo,
  transaction = null
) => {
  if (parseInt(actorId) === parseInt(targetUserId)) return;
  if (!projectInfo) return;

  const actor = await User.findByPk(actorId);
  const actorName = actor ? actor.full_name : "Quản trị viên";

  await createNotification(
    {
      user_id: targetUserId,
      type: "PROJECT_INVITE",
      title: "Lời mời tham gia dự án",
      noti_content: `${actorName} đã thêm bạn vào dự án "${projectInfo.project_name}".`,
      entity_type: "project",
      entity_id: projectInfo.project_id,
    },
    transaction
  );
};

// 4. Comment mới
const notifyTaskComment = async (
  actorId,
  targetUserId,
  taskInfo,
  commentContent,
  transaction = null
) => {
  if (parseInt(actorId) === parseInt(targetUserId)) return;
  if (!taskInfo) return;

  const actor = await User.findByPk(actorId);
  const actorName = actor ? actor.full_name : "Ai đó";

  const shortContent =
    commentContent.length > 50
      ? commentContent.substring(0, 50) + "..."
      : commentContent;

  await createNotification(
    {
      user_id: targetUserId,
      type: "COMMENT",
      title: "Bình luận mới",
      noti_content: `${actorName} đã bình luận trong "${taskInfo.task_name}": ${shortContent}`,
      entity_type: "task",
      entity_id: taskInfo.task_id,
    },
    transaction
  );
};

module.exports = {
  createNotification,
  getNotificationsByUserId,
  getUnreadCountByUserId,
  markAsRead,
  markAllAsRead,
  notifyTaskAssignment,
  notifyTaskCompletion,
  notifyProjectInvite,
  notifyTaskComment,
};
