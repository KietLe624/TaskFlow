const db = require("../models/index.model"); // Import file index trung tâm
const User = db.User; // Lấy model User từ đối tượng db

const getAllUsers = async (req, res) => {
  try {
    // Lấy toàn bộ danh sách users
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, // loại bỏ trường password cho an toàn
      order: [["user_id", "ASC"]], // sắp xếp theo ID tăng dần
    });

    // Nếu không có dữ liệu
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Trả về danh sách
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
;

module.exports = {
  getAllUsers,
};