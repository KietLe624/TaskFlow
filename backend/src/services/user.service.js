const db = require("../models/index.model");
const User = db.User; // Lấy model User từ đối tượng db

// func get all users
const getAllUsers = async () => {
    try {
        const users = await User.findAll({ attributes: { exclude: ["password"] } });
        return users;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        throw error;
    }
};
// get user by id
const getUserById = async (user_id) => {
    try {
        const user = await User.findByPk(user_id, { attributes: { exclude: ["password"] } });
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

// export module
module.exports = {
    getAllUsers,
    getUserById,
    deleteUser,
    updateUser,
};