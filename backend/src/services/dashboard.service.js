// src/services/dashboard.service.js
const db = require("../models/index.model");
const { User, Project, Task, Team } = db;

const getDashboardData = async (userId) => {
  // Kiểm tra trạng thái đăng nhập
  if (!userId) throw new Error("User chưa đăng nhập");

  // Thực thi song song các truy vấn
  const [
    tasksInProgress,
    tasksCompleted,
    tasksOverdue,
    recentProjects,
    teamCount,
  ] = await Promise.all([
    // Task đang tiến hành
    Task.count({
      include: [
        {
          model: User,
          as: "assignees",
          where: { user_id: userId },
          through: { attributes: [] },
        },
      ],
      where: { status: "in_progress" },
    }),

    // Task đã hoàn thành
    Task.count({
      include: [
        {
          model: User,
          as: "assignees",
          where: { user_id: userId },
          through: { attributes: [] },
        },
      ],
      where: { status: "done" },
    }),

    // Task quá hạn
    Task.count({
      include: [
        {
          model: User,
          as: "assignees",
          where: { user_id: userId },
          through: { attributes: [] },
        },
      ],
      where: { status: "overdue" },
    }),

    // Project gần đây
    Project.findAll({
      where: { owner_id: userId },
      attributes: ["project_id", "project_name", "created_at"],
      order: [["created_at", "DESC"]],
      limit: 5,
    }),

    // Team đang tham gia
    Team.count({
      include: [
        {
          model: User,
          as: "members",
          where: { user_id: userId },
          through: { attributes: [] },
        },
      ],
    }),
  ]);
  return {
    tasks: {
      inProgress: tasksInProgress,
      completed: tasksCompleted,
      overdue: tasksOverdue,
    },
    projects: {
      totalRecent: recentProjects.length,
      recent: recentProjects,
    },
    teams: {
      count: teamCount,
    },
  };
};

module.exports = {
  getDashboardData,
};
