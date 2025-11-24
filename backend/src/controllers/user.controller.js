const userService = require("../services/user.service");
// func get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ message: "Lấy người dùng thành công", users });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// func get user by id
const getUserById = async (req, res) => {
  const { user_id } = req.params;
  try {
    const user = await userService.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    res.status(200).json({ message: "Lấy người dùng thành công", user });
  } catch (error) {
    console.error("Lỗi khi lấy người dùng:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
// create user
const createUser = async (req, res) => {
  try {
    const { username, email, full_name, role } = req.body;

    if (!username || !email) {
      return res.status(400).json({ message: "Thiếu username hoặc email" });
    }

    const result = await userService.createUser({
      username,
      email,
      full_name,
      role: role || "member",
    });

    // Chỉ trả về mật khẩu ở môi trường dev
    if (process.env.NODE_ENV !== "production") {
      result.defaultPassword = "123456";
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Admin create user error:", error);
    res.status(400).json({ message: error.message });
  }
};

// func update user
const updateUser = async (req, res) => {
  const { user_id } = req.params;
  const userData = req.body;
  try {
    const updatedUser = await userService.updateUser(user_id, userData);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// func delete user
const deleteUser = async (req, res) => {
  const { user_id } = req.params;
  try {
    await userService.deleteUser(user_id);
    res.status(200).json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// change role
const changeUserRole = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { name } = req.body;
    const roleName = name;

    const updatedUser = await userService.changeUserRole(user_id, roleName);
    res.status(200).json({
      message: `Thay đổi vai trò người dùng thành công: ${updatedUser.username} bây giờ là ${roleName}`,
    });
  } catch (error) {
    console.error("Lỗi khi thay đổi vai trò người dùng:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
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
