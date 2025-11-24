const { where } = require("sequelize");
const db = require("../models/index.model");
const bcryptjs = require("bcryptjs");
const {
  User,
  Role,
  UserRole,
  TaskAssignees,
  Task,
  Project,
  Team,
  TeamMember,
  Activity,
} = db; // Lấy model User từ đối tượng db

// func get all users
const getAllUsers = async () => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      include: [
        {
          model: db.Role,
          as: "roles",
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    });
    return users;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    throw error;
  }
};
// get user by id
const getUserById = async (user_id) => {
  try {
    const user = await User.findByPk(user_id, {
      attributes: { exclude: ["password"] },
    });
    const tasksCompleted = await Task.count({
      where: { status: "completed" },
      include: [
        {
          model: User,
          as: "assignees",
          where: { user_id }, // lọc user được gán
          through: { attributes: [] }, // không lấy trường của junction table
          required: true, // bắt buộc phải có assignee này để đếm
        },
      ],
    });

    const projectCount = await user.countProjects(); // nhờ association
    const teamCount = await user.countTeams();

    const recentActivities = await Activity.findAll({
      where: { user_id: user_id },
      order: [["created_at", "DESC"]],
      limit: 10,
      include: [
        { model: Project, as: "project", attributes: ["project_name"] },
        { model: Task, as: "task", attributes: ["task_name"] },
      ],
    });

    const teams = await Team.findAll({
      include: [
        {
          model: TeamMember,
          as: "teamMemberships",
          where: { user_id: user_id },
          attributes: ["role"],
        },
      ],
      attributes: ["team_id", "team_name"],
    });
    return {
      user,
      stats: {
        tasksCompleted,
        projects: projectCount,
        teams: teamCount,
      },
      recentActivities,
      teams: teams.map((t) => ({
        team_id: t.team_id,
        team_name: t.team_name,
        role: t.teamMemberships?.[0]?.role || "member",
      })),
    };
  } catch (error) {
    console.error("Lỗi khi lấy người dùng:", error);
    throw error;
  }
};
// create user
const createUser = async ({
  username,
  email,
  full_name = null,
  role = "member",
}) => {
  // Kiểm tra trùng username/email
  const existUser = await db.User.findOne({
    where: {
      [db.Sequelize.Op.or]: [{ username }, { email }],
    },
  });

  if (existUser) {
    throw new Error("Username hoặc email đã tồn tại");
  }

  // Mật khẩu mặc định
  const defaultPassword = "123456";
  const hashedPassword = await bcryptjs.hash(defaultPassword, 10);

  // Tạo user
  const newUser = await db.User.create({
    username,
    email,
    full_name,
    password: hashedPassword,
  });

  // Gán role
  const roleRecord = await db.Role.findOne({ where: { name: role } });
  if (!roleRecord) {
    throw new Error("Role không tồn tại");
  }

  await db.UserRole.create({
    user_id: newUser.user_id,
    role_id: roleRecord.role_id,
  });

  return {
    message: "Tạo người dùng thành công",
    user_id: newUser.user_id,
    username: newUser.username,
    email: newUser.email,
    defaultPassword, // chỉ trả về ở dev
  };
};

// update user
const updateUser = async (user_id, userData) => {
  // kiểm tra thông tin đầu vào
  if (!user_id) {
    throw new Error("user_id không được để trống");
  }
  try {
    const user = await User.findByPk(user_id);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }
    await user.update(userData);
    return user;
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    throw error;
  }
};
// delete user
const deleteUser = async (user_id) => {
  if (!user_id) {
    throw new Error("user_id không được để trống");
  }
  try {
    const user = await User.findByPk(user_id);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }
    await user.destroy();
    return;
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    throw error;
  }
};

// change user role
const changeUserRole = async (user_id, roleName) => {
  try {
    const user = await User.findByPk(user_id);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      throw new Error("Vai trò không tồn tại");
    }
    console.log("role:", role);
    if (user && role) {
      await user.addRole(role);
    } else {
      throw new Error("User hoặc Role không tìm thấy.");
    }
    return user;
  } catch (error) {
    console.error("Lỗi khi thay đổi vai trò người dùng:", error);
    throw error;
  }
};
// export module
module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
};
