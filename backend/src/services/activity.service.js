const db = require("../models/index.model");
const { Activity, User } = db;
const { Op } = require("sequelize");

const logActivity = async (payload, transaction) => {
  const { user_id, entity_type, entity_id, action, description } = payload;

  // Debug để chắc chắn không bị undefined/null
  console.log("🔎 logActivity payload:", {
    user_id,
    entity_type,
    entity_id,
    action,
  });

  if (!user_id || !entity_type || !entity_id || !action) {
    throw new Error(
      "logActivity: missing required fields (user_id, entity_type, entity_id, action)"
    );
  }

  return Activity.create(
    { user_id, entity_type, entity_id, action, description },
    { transaction }
  );
};

const getAllActivities = async ({ page, limit, type, action, search }) => {
  try {
    const currentPage = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 20;
    const offset = (currentPage - 1) * pageSize;

    const whereCondition = {};

    if (type && type !== "all") {
      whereCondition.entity_type = type;
    }
    if (action && action !== "all") {
      whereCondition.action = action;
    }

    if (search) {
      whereCondition.description = {
        [Op.like]: `%${search}%`,
      };
    }

    const { count, rows } = await Activity.findAndCountAll({
      where: whereCondition,
      limit: pageSize,
      offset: offset,
      order: [["created_at", "DESC"]], // Mới nhất lên đầu
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "username", "full_name", "avatar_url"],
        },
      ],
    });

    return {
      data: rows,
      meta: {
        totalItems: count,
        totalPages: Math.ceil(count / pageSize),
        currentPage: currentPage,
        pageSize: pageSize,
      },
    };
  } catch (error) {
    console.error("Lỗi lấy danh sách activity (Service):", error);
    throw error;
  }
};

module.exports = {
  logActivity,
  getAllActivities,
};
