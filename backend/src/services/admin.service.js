const db = require("../models/index.model");
const { Op } = db.Sequelize;
const { User, Role, UserRole, Project } = db;

const getDashboardStats = async () => {
  const [totalUsers, totalProjects, totalTeams, activeTasks, overdueTasks] =
    await Promise.all([
      db.User.count(),
      db.Project.count(),
      db.Team.count(),
      db.Task.count({ where: { status: { [Op.notIn]: ["completed"] } } }),
      db.Task.count({
        where: {
          due_date: { [Op.lt]: new Date() },
          status: { [Op.not]: "completed" },
        },
      }),
    ]);

  const recentActivities = await db.Activity.findAll({
    limit: 10,
    order: [["created_at", "DESC"]],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["user_id", "username", "full_name", "avatar_url"],
      },
    ],
  });
  return {
    totalUsers,
    totalProjects,
    totalTeams,
    activeTasks,
    overdueTasks,
    // services/admin.service.js – SỬA CHỈ 1 ĐOẠN MAP
    recentActivities: recentActivities.map((a) => ({
      activity_id: a.activity_id,
      user_id: a.user?.user_id,
      username: a.user?.username,
      full_name: a.user?.full_name || a.user?.username || "Unknown User", // ĐÚNG
      avatar_url: a.user?.avatar_url, // ĐÚNG
      action: a.description || `${a.action} ${a.entity_type}`,
      created_at: a.created_at,
    })),
  };
};

module.exports = {
  getDashboardStats,
};
