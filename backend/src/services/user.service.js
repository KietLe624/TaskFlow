const db = require("../models/index.model");
const { User, Role, UserRole } = db; // Lấy model User từ đối tượng db

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
    return user;
  } catch (error) {
    console.error("Lỗi khi lấy người dùng:", error);
    throw error;
  }
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
  deleteUser,
  updateUser,
  changeUserRole,
};
