const db = require("../models/index.model");
const NotificationService = require("./notification.service");
const { sequelize, User, Project, Task, Activity, TaskComment, TaskAssignees } =
  db;
const { logActivity } = require("./activity.service");
const { Op } = require("sequelize");

//  CREATE TASK
// const createTask = async (taskData, user_id) => {
//   const t = await sequelize.transaction();
//   try {
//     const {
//       task_name,
//       project_id,
//       parent_id,
//       description,
//       status,
//       priority,
//       start_date,
//       due_date,
//       assignee_ids = [], // ← frontend gửi mảng [3,7,12]
//     } = taskData;

//     // Tạo task trước
//     const task = await Task.create(
//       {
//         task_name,
//         project_id: project_id || null,
//         parent_id: parent_id || null,
//         description: description || "",
//         status: status || "to_do",
//         priority: priority || "medium",
//         start_date,
//         due_date,
//         created_by: user_id,
//       },
//       { transaction: t }
//     );

//     if (assignee_ids.length > 0) {
//       const records = assignee_ids.map((user_id) => ({
//         task_id: task.task_id,
//         user_id: user_id,
//         assigned_by: user_id, // người tạo task giao việc
//         assigned_at: new Date(),
//       }));
//       await sequelize.models.TaskAssignees.bulkCreate(records, {
//         transaction: t,
//       });
//       for (const assigneeId of assignee_ids) {
//         await NotificationService.notifyTaskAssignment(
//           user_id, // Người gán (Actor)
//           assigneeId, // Người nhận (Target)
//           task, // Thông tin Task
//           t // Transaction
//         );
//       }
//     }

//     await logActivity(
//       {
//         user_id: user_id,
//         entity_type: "task",
//         entity_id: task.task_id,
//         action: "created",
//         description: `Tạo công việc: ${task.task_name}`,
//       },
//       t
//     );

//     await t.commit();
//     return task;
//   } catch (err) {
//     await t.rollback();
//     throw err;
//   }
// };
// task.service.js

const createTask = async (taskData, user_id) => {
  const t = await sequelize.transaction();
  try {
    const {
      task_name,
      project_id,
      parent_id,
      description,
      status,
      priority,
      start_date,
      due_date,
      assignee_ids = [],
      created_by: overrideCreatorId, // 👇 Lấy thêm cái này từ data gửi lên
    } = taskData;

    // --- LOGIC CHỌN NGƯỜI TẠO ---
    // Nếu có overrideCreatorId (do Admin gửi) thì dùng, không thì dùng người đang login (user_id)
    const finalCreatorId = overrideCreatorId || user_id;

    // Tạo task
    const task = await Task.create(
      {
        task_name,
        project_id: project_id || null,
        parent_id: parent_id || null,
        description: description || "",
        status: status || "to_do",
        priority: priority || "medium",
        start_date: start_date || new Date(), // Mặc định là hôm nay nếu thiếu
        due_date,
        created_by: finalCreatorId, // Dùng ID đã chốt
      },
      { transaction: t }
    );

    // Xử lý người được giao việc
    if (assignee_ids.length > 0) {
      const records = assignee_ids.map((assigneeId) => ({
        task_id: task.task_id,
        user_id: assigneeId,
        assigned_by: user_id, // Người thực hiện hành động gán vẫn là người đang login (Admin)
        assigned_at: new Date(),
      }));

      await sequelize.models.TaskAssignees.bulkCreate(records, {
        transaction: t,
      });

      // Bắn thông báo
      for (const assigneeId of assignee_ids) {
        // Không thông báo nếu tự giao cho chính mình
        if (Number(assigneeId) !== Number(user_id)) {
          await NotificationService.notifyTaskAssignment(
            user_id, // Actor: Người thực hiện (Admin)
            assigneeId, // Target: Người được giao
            task,
            t
          );
        }
      }
    }

    // Log hoạt động
    await logActivity(
      {
        user_id: user_id, // Người thực hiện thao tác là người đang login
        entity_type: "task",
        entity_id: task.task_id,
        action: "created",
        description: `Tạo công việc: ${task.task_name}`,
      },
      t
    );

    await t.commit();
    return task;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

//  GET ALL TASKS
const getAllTasks = async () => {
  return await Task.findAll();
};

//  GET TASK BY ID
const getTaskById = async (taskId) => {
  return await Task.findByPk(taskId, {
    include: [
      { model: Project, as: "project" },
      {
        model: User,
        as: "creator",
        attributes: ["user_id", "username", "email"],
      },
      {
        model: User,
        as: "assignees",
        attributes: ["user_id", "username", "email"],
        through: { attributes: [] },
      },
    ],
  });
};

//  UPDATE TASK
const updateTask = async (taskId, updatedData, current_user_id = null) => {
  const t = await sequelize.transaction();
  try {
    const task = await Task.findByPk(taskId, { transaction: t });
    if (!task) throw new Error("Task not found");

    const { assignee_ids, ...taskFields } = updatedData;

    await task.update(taskFields, { transaction: t });

    // CẬP NHẬT ASSIGNEES
    if (updatedData.status === "completed" && task.status === "completed") {
      // (Logic check task.status ở trên là sau khi đã update rồi)
      await NotificationService.notifyTaskCompletion(
        current_user_id, // Người bấm hoàn thành
        task.created_by, // Người tạo task
        task,
        t
      );
    }

    // 2. CẬP NHẬT ASSIGNEES
    if (assignee_ids !== undefined) {
      await sequelize.models.TaskAssignees.destroy({
        where: { task_id: taskId },
        transaction: t,
      });

      if (assignee_ids.length > 0) {
        const records = assignee_ids.map((user_id) => ({
          task_id: taskId,
          user_id,
          assigned_by: current_user_id || task.created_by,
          assigned_at: new Date(),
        }));
        await sequelize.models.TaskAssignees.bulkCreate(records, {
          transaction: t,
        });

        if (assignee_ids !== undefined) {
          // --- BƯỚC 1: Lấy danh sách ID hiện tại TRƯỚC KHI xóa ---
          const currentRecords = await TaskAssignees.findAll({
            where: { task_id: taskId },
            attributes: ["user_id"],
            transaction: t,
          });
          const currentIds = currentRecords.map((r) => r.user_id);

          // --- BƯỚC 2: Tìm ra những người MỚI (Có trong assignee_ids nhưng không có trong currentIds) ---
          // Ví dụ: Cũ [1, 2], Mới [1, 2, 3] -> Người mới là [3]
          const newMembersToNotify = assignee_ids.filter(
            (id) => !currentIds.includes(id)
          );

          // --- BƯỚC 3: Cập nhật DB (Vẫn giữ logic Xóa hết đi tạo lại cho sạch data) ---
          await TaskAssignees.destroy({
            where: { task_id: taskId },
            transaction: t,
          });

          if (assignee_ids.length > 0) {
            const records = assignee_ids.map((user_id) => ({
              task_id: taskId,
              user_id,
              assigned_by: current_user_id || task.created_by,
              assigned_at: new Date(),
            }));

            await TaskAssignees.bulkCreate(records, {
              transaction: t,
            });

            // --- BƯỚC 4: Chỉ bắn thông báo cho người MỚI ---
            for (const assigneeId of newMembersToNotify) {
              await NotificationService.notifyTaskAssignment(
                current_user_id || task.created_by, // Người thực hiện gán
                assigneeId, // Người được gán
                task,
                t
              );
            }
          }
        }
      }
    }
    await t.commit();
    return task;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

//  DELETE TASK
const deleteTask = async (taskId) => {
  const task = await Task.findByPk(taskId);
  if (!task) throw new Error("Không tìm thấy task");

  await task.destroy();
  return true;
};

//  GET TASKS BY USER
const getTasksByUserId = async (userId) => {
  return await Task.findAll({
    where: {
      [Op.or]: [{ created_by: userId }, { "$assignees.user_id$": userId }],
    },
    include: [
      { model: Project, as: "project" },
      {
        model: User,
        as: "creator",
        attributes: ["user_id", "username", "email"],
      },
      {
        model: User,
        as: "assignees",
        attributes: ["user_id", "username", "email"],
        through: { attributes: [] },
      },
    ],
  });
};

// get task by project id
const getTasksByProjectId = async (projectId) => {
  return await Task.findAll({
    where: { project_id: projectId },
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["user_id", "username", "email"],
      },
      {
        model: User,
        as: "assignees",
        attributes: ["user_id", "username", "email"],
        through: { attributes: [] },
      },
    ],
  });
};

const getStatus = async () => {
  try {
    const statuses = await Task.rawAttributes.status.values;
    return statuses;
  } catch (error) {
    console.error("Lỗi lấy trạng công việc (Service):", error);
    throw error;
  }
};

const getPriorities = async () => {
  try {
    const priorities = await Task.rawAttributes.priority.values;
    return priorities;
  } catch (error) {
    console.error("Lỗi lấy mức độ ưu tiên (Service): ", error);
    throw error;
  }
};

const processTasks = async (whereClause) => {
  try {
    const totalTasks = await Task.count({ where: whereClause });

    if (totalTasks === 0) return 0;

    const completedTasks = await Task.count({
      where: {
        ...whereClause,
        status: {
          [Op.or]: ["completed"],
        },
      },
    });
    const progress = (completedTasks / totalTasks) * 100;
    return Math.round(progress);
  } catch (error) {
    console.error("Lỗi khi tính progress:", error);
    return 0;
  }
};

// Thêm comment
const addComment = async (taskId, user_id, content) => {
  const t = await sequelize.transaction();
  const comment = await sequelize.models.TaskComment.create({
    task_id: taskId,
    user_id,
    content,
  });
  const task = await Task.findByPk(taskId, { transaction: t });
  if (task) {
    // Bắn thông báo cho Creator (nếu người cmt không phải creator)
    if (task.created_by !== user_id) {
      await NotificationService.notifyTaskComment(
        user_id, // Người comment
        task.created_by, // Người nhận (Creator)
        task, // Info task
        content,
        t
      );
    }

    // Log Activity (Optional)
    await logActivity(
      {
        user_id,
        entity_type: "task",
        entity_id: taskId,
        action: "commented",
        description: `Đã bình luận: ${content.substring(0, 30)}...`,
      },
      t
    );
  }

  await t.commit();

  // Trả về data để hiển thị
  return await TaskComment.findByPk(comment.cmt_id, {
    include: [
      {
        model: User,
        as: "author",
        attributes: ["user_id", "username", "avatar_url"],
      },
    ],
  });
};

// Lấy tất cả comment của task
const getCommentsByTaskId = async (taskId) => {
  if (!taskId) {
    throw new Error("taskId là bắt buộc!");
  }
  return await sequelize.models.TaskComment.findAll({
    where: { task_id: taskId },
    order: [["created_at", "ASC"]],
    include: [
      {
        model: sequelize.models.User,
        as: "author",
        attributes: ["user_id", "username", "avatar_url"],
      },
    ],
  });
};

const searchTasks = async (userId, filters) => {
  const { keyword, projectId, status, priority, dueDateFrom } = filters;

  // 1. Điều kiện cơ bản: Task của user này (hoặc được assign)
  const whereClause = {
    [Op.or]: [{ created_by: userId }, { "$assignees.user_id$": userId }],
  };

  // 2. Lọc theo Keyword (Tên task)
  if (keyword) {
    whereClause.task_name = { [Op.like]: `%${keyword}%` };
  }

  // 3. Lọc theo Project
  if (projectId && projectId !== "null" && projectId !== 0) {
    whereClause.project_id = projectId;
  }

  // 4. Lọc theo Status & Priority
  if (status) whereClause.status = status;
  if (priority) whereClause.priority = priority;

  // 5. Lọc theo Ngày (Hạn chót từ ngày X trở đi)
  if (dueDateFrom) {
    whereClause.due_date = {
      [Op.gte]: new Date(dueDateFrom), // gte: Lớn hơn hoặc bằng
    };
  }

  return await Task.findAll({
    where: whereClause,
    include: [
      { model: Project, as: "project", attributes: ["name"] },
      {
        model: User,
        as: "assignees",
        attributes: ["user_id", "username", "email"],
        through: { attributes: [] }, // Bỏ bảng trung gian
      },
    ],
    order: [["created_at", "DESC"]], // Mới nhất lên đầu
  });
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByUserId,
  getTasksByProjectId,
  getStatus,
  getPriorities,
  processTasks,
  addComment,
  getCommentsByTaskId,
  searchTasks,
};
