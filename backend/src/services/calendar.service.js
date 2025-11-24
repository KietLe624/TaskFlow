const db = require("../models/index.model");
const { Op } = require("sequelize");

/**
 * Lấy danh sách task cho Calendar theo khoảng thời gian
 * Trả về cấu trúc JSON chi tiết (Project, Creator, Assignees)
 */
const getTasksForCalendar = async ({
  userId,
  startDate,
  endDate,
  projectId,
}) => {
  try {
    // 1. Tạo điều kiện lọc thời gian (Start hoặc Due date nằm trong khung nhìn)
    const dateCondition = {
      [Op.or]: [
        {
          start_date: {
            [Op.between]: [startDate, endDate],
          },
        },
        {
          due_date: {
            [Op.between]: [startDate, endDate],
          },
        },
      ],
    };

    // 2. Tạo điều kiện WHERE tổng
    const whereCondition = {
      ...dateCondition,
    };

    // Nếu có lọc theo Project cụ thể
    if (projectId) {
      whereCondition.project_id = projectId;
    }

    // 3. Thực hiện Query
    const tasks = await db.Task.findAll({
      where: whereCondition,
      // Chỉ lấy các cột Task bạn cần
      attributes: [
        "task_id",
        "task_name",
        "start_date",
        "due_date",
        "status",
        "priority",
      ],
      include: [
        // --- A. LẤY THÔNG TIN PROJECT ---
        {
          model: db.Project,
          as: "project", // Alias phải khớp model (belongsTo)
          attributes: ["project_id", "project_name"],
        },

        // --- B. LẤY THÔNG TIN CREATOR (Người tạo) ---
        {
          model: db.User,
          as: "creator", // Alias phải khớp model (belongsTo)
          attributes: ["user_id", "full_name"],
        },

        // --- C. LẤY DANH SÁCH ASSIGNEES (Người được giao) ---
        {
          model: db.User,
          as: "assignees", // Alias phải khớp model (belongsToMany)
          attributes: ["user_id", "full_name"], // Chỉ lấy ID và Tên
          through: {
            attributes: [], // QUAN TRỌNG: Dòng này để ẩn cái bảng trung gian TaskAssignees đi
          },
          // Logic lọc theo User:
          // Nếu userId được truyền vào, ta chỉ lấy những task MÀ user này có tham gia.
          // required: true biến nó thành INNER JOIN -> Chỉ trả về task có user này.
          where: userId ? { user_id: userId } : undefined,
          required: !!userId,
        },
      ],
      order: [["start_date", "ASC"]], // Sắp xếp theo ngày bắt đầu
    });

    return {
      success: true,
      data: tasks,
    };
  } catch (error) {
    console.error("Lỗi lấy dữ liệu Calendar:", error);
    throw error;
  }
};

module.exports = {
  getTasksForCalendar,
};
