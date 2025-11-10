const { Op, Sequelize } = require("sequelize");
const db = require("../models/index.model");
const { Task, User, Project, Activity } = db;

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};
const subDays = (date, days) => addDays(date, -days);

const getTaskOverviewCounts = async (
  userId,
  { newDays = 7, nearDays = 3 } = {}
) => {
  const now = new Date();
  const newSince = subDays(now, newDays);
  const nearUntil = addDays(now, nearDays);

  // Kiểm tra alias 'assignees'
  const hasAssignees = !!(Task.associations && Task.associations.assignees);

  const includeAssignees = hasAssignees
    ? [
        {
          model: User,
          as: "assignees",
          attributes: [],
          through: { attributes: [] },
          required: false,
        },
      ]
    : [];

  const assignedToUser = hasAssignees
    ? Sequelize.where(Sequelize.col("assignees.user_id"), userId)
    : null;

  const baseWhere = hasAssignees
    ? { [Op.or]: [{ created_by: userId }, assignedToUser] }
    : { created_by: userId };

  const countArgs = {
    include: includeAssignees,
    distinct: true,
    col: "task_id",
    subQuery: false,
  };

  const [newTasks, tasksDone, nearDueTasks, overdueTasks] = await Promise.all([
    Task.count({
      ...countArgs,
      where: { ...baseWhere, created_at: { [Op.gte]: newSince } },
    }),
    Task.count({ ...countArgs, where: { ...baseWhere, status: "done" } }),
    Task.count({
      ...countArgs,
      where: {
        ...baseWhere,
        status: { [Op.notIn]: ["done", "cancelled"] },
        due_date: { [Op.gte]: now, [Op.lt]: nearUntil },
      },
    }),
    Task.count({
      ...countArgs,
      where: {
        ...baseWhere,
        status: { [Op.notIn]: ["done", "cancelled"] },
        due_date: { [Op.lt]: now },
      },
    }),
  ]);

  return { newTasks, tasksDone, nearDueTasks, overdueTasks };
};

const getOverviewTasks = async (userId, limit = 5) => {
  const rows = await Task.findAll({
    where: { created_by: userId },
    include: [
      {
        model: User,
        as: "assignees",
        attributes: ["username", "avatar_url"],
        through: { attributes: [] },
      },
    ],
    order: [["created_at", "DESC"]],
    limit,
  });

  return rows.map((t) => ({
    id: t.task_id,
    status: t.status, // 'to_do' | 'in_progress' | 'done' | ...
    date: formatDate(t.created_at),
    title: t.task_name,
    description: t.description,
    assignees: (t.assignees || []).map((a) => ({
      username: a.username,
      avatarUrl: a.avatar_url,
    })),
    progressText:
      t.status === "done"
        ? "Hoàn thành"
        : t.status === "in_progress"
        ? "Đang xử lý"
        : "Chưa bắt đầu",
  }));
};

const getPendingProjects = async (userId, limit = 5) => {
  const rows = await Project.findAll({
    where: { owner_id: userId, status: "in_progress" },
    include: [{ model: Task, as: "tasks", attributes: ["task_id", "status"] }],
    order: [["due_date", "ASC"]],
    limit,
  });

  return rows.map((p) => ({
    project_id: p.project_id,
    project_name: p.project_name,
    description: p.description,
    status: p.status,
    start_date: formatDate(p.start_date),
    due_date: formatDate(p.due_date),
    progressPercent: calcProgress(p.tasks),
    taskCount: p.tasks?.length || 0,
    attachmentCount: 0, // đếm attachment
  }));
};

const getLatestActivities = async (userId, limit = 30) => {
  const acts = await Activity.findAll({
    where: { user_id: userId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["username", "full_name", "avatar_url"],
      },
    ],
    order: [["created_at", "DESC"]],
    limit,
  });

  const items = acts.map((a) => ({
    id: a.activity_id,
    userAvatar: a.user?.avatar_url || null,
    userName: a.user?.full_name || a.user?.username || "Unknown",
    action: formatActivityText(a),
    entity_type: a.action + "_" + a.entity_type,
    created_at: a.created_at,
  }));

  return groupActivitiesByDate(items);
};

const getDashboardData = async (userId) => {
  if (!userId)
    throw new Error("Người dùng chưa đăng nhập hoặc token không hợp lệ");
  const [taskSummary, overviewTasks, pendingProjects, latestActivities] =
    await Promise.all([
      getTaskOverviewCounts(userId),
      getOverviewTasks(userId),
      getPendingProjects(userId),
      getLatestActivities(userId),
    ]);
  return { taskSummary, overviewTasks, pendingProjects, latestActivities };
};

function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}
function formatTime(date) {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}
function calcProgress(tasks) {
  if (!tasks || tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === "done").length;
  return Math.round((done / tasks.length) * 100);
}
function formatActivityText(a) {
  const { action, entity_type, description } = a;
  switch (action) {
    case "created":
      return `Tạo ${entity_type}`;
    case "updated":
      return `Cập nhật ${entity_type}`;
    case "deleted":
      return `Xoá ${entity_type}`;
    case "status_change":
      return `Đổi trạng thái ${entity_type}`;
    case "commented":
      return `Bình luận vào ${entity_type}`;
    case "uploaded":
      return `Tải lên ${entity_type}`;
    default:
      return description || "Thực hiện hành động";
  }
}

// Gom activity theo ngày (DD/MM/YYYY)
function groupActivitiesByDate(activities) {
  const groups = {};

  for (const act of activities) {
    const dateKey = formatDate(act.created_at); // "dd/MM/yyyy"
    if (!groups[dateKey]) groups[dateKey] = [];

    groups[dateKey].push({
      id: act.id,
      userAvatar: act.userAvatar || null,
      userName: act.userName || "Unknown",
      action: act.action,
      entity_type: act.entity_type,
      time: formatTime(act.created_at), // "HH:mm"
    });
  }

  return Object.entries(groups)
    .map(([date, items]) => ({ date, items }))
    .sort((a, b) => {
      const [da, ma, ya] = a.date.split("/").map(Number);
      const [db, mb, yb] = b.date.split("/").map(Number);
      return new Date(yb, mb - 1, db) - new Date(ya, ma - 1, da);
    });
}

module.exports = {
  getDashboardData,
  getTaskOverviewCounts,
};
