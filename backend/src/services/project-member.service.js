const db = require("../models/index.model");

const changeRole = async (project_id, user_id, newRole, currentUserId) => {
  try {
    // --- BẮT ĐẦU KHỐI TRY ---

    // 1. Kiểm tra người đổi có phải owner không
    const isOwner = await db.ProjectMember.findOne({
      where: {
        project_id,
        user_id: currentUserId,
        role: "owner",
      },
    });

    if (!isOwner) {
      const err = new Error(
        "Chỉ owner dự án mới được thay đổi vai trò thành viên"
      );
      err.status = 403;
      throw err; // Ném lỗi xuống catch
    }

    // 2. Tìm membership cần đổi
    const membership = await db.ProjectMember.findOne({
      where: { project_id, user_id },
    });

    if (!membership) {
      const err = new Error("Thành viên không tồn tại trong dự án");
      err.status = 404;
      throw err;
    }

    // 3. Validate role
    if (!["owner", "member"].includes(newRole)) {
      const err = new Error(
        "Vai trò không hợp lệ. Chỉ chấp nhận 'owner' hoặc 'member'"
      );
      err.status = 400;
      throw err;
    }

    // Lưu lại role cũ trước khi update để trả về cho chính xác
    const oldRole = membership.role;

    // 4. Cập nhật role
    await membership.update({ role: newRole });

    // Trả về kết quả thành công
    return {
      success: true, // Đánh dấu là thành công
      message: "Đổi vai trò thành công",
      data: {
        project_id,
        user_id,
        old_role: oldRole,
        new_role: newRole,
      },
    };
  } catch (error) {
    // --- BẮT ĐẦU KHỐI CATCH ---

    // Log lỗi ra console để debug (tùy chọn)
    console.error("Lỗi trong changeRole:", error.message);

    // Trả về object lỗi thay vì ném exception sập app
    return {
      success: false, // Đánh dấu là thất bại
      status: error.status || 500, // Nếu không có status thì mặc định là lỗi server (500)
      message: error.message || "Đã xảy ra lỗi máy chủ nội bộ",
    };
  }
};

const removeMember = async (project_id, user_id, currentUserId) => {
  // Check quyền owner giống trên
  const isOwner = await db.ProjectMember.findOne({
    where: { project_id, user_id: currentUserId, role: "owner" },
  });

  if (!isOwner) {
    const err = new Error("Chỉ owner mới được xóa thành viên");
    err.status = 403;
    throw err;
  }

  const membership = await db.ProjectMember.findOne({
    where: { project_id, user_id },
  });

  if (!membership) {
    const err = new Error("Thành viên không tồn tại");
    err.status = 404;
    throw err;
  }

  await membership.destroy();

  return { message: "Xóa thành viên thành công" };
};

module.exports = {
  changeRole,
  removeMember,
};
