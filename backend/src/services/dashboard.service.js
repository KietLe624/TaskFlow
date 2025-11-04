const db = require("../models/index.model");
const { User, Project, Task, Activity, Attachment } = db;
const { Op } = require("sequelize");

const getDashboardData = async (userId) => {
  if (!userId)
    throw new Error("Người dùng chưa đăng nhập hoặc token không hợp lệ");

  try {
    //  Tổng quan Task
    const [newTasks, tasksDone] = await Promise.all([
      Task.count({
        where: { status: "to_do", created_by: userId },
      }),
      Task.count({
        where: { status: "done", created_by: userId },
      }),
    ]);

    const taskSummary = { newTasks, tasksDone };

    //  Overview Tasks (các task gần đây nhất của user)
    const overviewTasks = await Task.findAll({
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
      limit: 5,
    }).then((tasks) =>
      tasks.map((t) => ({
        id: t.task_id,
        status: t.status,
        date: formatDate(t.created_at),
        title: t.task_name,
        description: t.description,
        assignees:
          t.assignees?.map((a) => ({
            username: a.username,
            avatarUrl: a.avatar_url,
          })) || [],
        progressText:
          t.status === "completed"
            ? "Hoàn thành"
            : t.status === "in_progress"
            ? "Đang xử lý"
            : "Chưa bắt đầu",
      }))
    );

    // Pending Projects (các project đang active)
    const pendingProjects = await Project.findAll({
      where: {
        owner_id: userId,
        status: "in_progress",
      },
      include: [
        {
          model: Task,
          as: "tasks",
          attributes: ["task_id", "status"],
        },
      ],
      order: [["due_date", "ASC"]],
      limit: 5,
    }).then((projects) =>
      projects.map((p) => ({
        project_id: p.project_id,
        project_name: p.project_name,
        progressPercent: calcProgress(p.tasks),
        taskCount: p.tasks?.length || 0,
        attachmentCount: 0,
        dueDate: formatDate(p.due_date),
      }))
    );

    // Latest Activities (dữ liệu thực tế từ bảng activities)
    const actsRaw = await Activity.findAll({
      where: { user_id: userId }, // chỉ lấy log của user hiện tại
      include: [
        {
          model: User,
          as: "user",
          attributes: ["username", "full_name", "avatar_url"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 30, // số log tối đa
    });

    // Chuẩn hóa dữ liệu trước khi nhóm
    const activities = actsRaw.map((a) => ({
      id: a.activity_id,
      userAvatar: a.user?.avatar_url || null,
      userName: a.user?.full_name || a.user.username,
      action: formatActivityText(a),
      created_at: a.created_at,
    }));

    // Nhóm theo ngày
    const latestActivities = groupActivitiesByDate(activities);

    return {
      taskSummary,
      overviewTasks,
      pendingProjects,
      latestActivities,
    };
  } catch (error) {
    console.error("Lỗi tại dashboardService.getDashboardData:", error);
    throw new Error("Không thể lấy dữ liệu dashboard");
  }
};

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0"); // Ngày với hai chữ số
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Tháng với hai chữ số
  const year = d.getFullYear(); // Năm đầy đủ
  return `${day}/${month}/${year}`; // định dạng DD/MM/YYYY
}

function calcProgress(tasks) {
  // kiểm tra nếu tasks rỗng
  if (!tasks || tasks.length === 0) {
    return 0;
  }
  const totalTasks = tasks.length; // tổng số task
  const completedTasks = tasks.filter((task) => task.status === "done").length; // số task đã hoàn thành
  const percentage = (completedTasks / totalTasks) * 100; // tính phần trăm
  return Math.round(percentage); // làm tròn và trả về
}

// Hàm để định dạng lại mô tả hành động
function formatActivityText(activity) {
  const { action, entity_type, description } = activity;

  // Tự động mô tả hành động đẹp hơn
  switch (action) {
    case "created":
      return `Tạo ${entity_type}`;
    case "updated":
      return `Cập nhật ${entity_type}`;
    case "deleted":
      return `Xóa ${entity_type}`;
    case "commented":
      return `Bình luận vào ${entity_type}`;
    case "uploaded":
      return `Tải lên ${entity_type}`;
    default:
      return description || "Thực hiện hành động";
  }
}

// Hàm để nhóm hoạt động theo ngày
function groupActivitiesByDate(activities) {
  const groups = {};
  activities.forEach((act) => {
    const date = formatDate(act.created_at); // định dạng ngày tháng
    if (!groups[date]) groups[date] = []; // khởi tạo mảng nếu chưa có
    groups[date].push({
      id: act.id,
      userAvatar: act.userAvatar,
      userName: act.userName,
      action: act.action,
      time: formatTime(act.created_at), // định dạng thời gian
    });
  });

  return Object.entries(groups).map(([date, items]) => ({ date, items }));
}

function formatTime(date) {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

module.exports = {
  getDashboardData,
  calcProgress,
  formatDate,
  groupActivitiesByDate,
};
