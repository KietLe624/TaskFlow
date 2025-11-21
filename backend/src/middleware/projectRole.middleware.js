const db = require("../models/index.model");

const authorizeProjectOwner = async (req, res, next) => {
  try {
    const { project_id } = req.params;
    const currentUserId = req.user.user_id;

    const membership = await db.ProjectMember.findOne({
      where: {
        project_id: project_id,
        user_id: currentUserId,
        role: "owner", // chỉ owner mới được đổi role
      },
    });

    if (!membership) {
      return res
        .status(403)
        .json({ message: "Chỉ owner mới được thay đổi vai trò thành viên" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Lỗi kiểm tra quyền" });
  }
};

module.exports = authorizeProjectOwner;
