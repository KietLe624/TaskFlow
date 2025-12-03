const e = require("express");
const db = require("../models/index.model");
const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");
const {
  User,
  Project,
  Task,
  ProjectMember,
  sequelize,
  Team,
  Conversation,
  ConversationParticipant,
  Activity,
} = db;
const { logActivity } = require("./activity.service");
const chatService = require("./chat.service");
const NotificationService = require("./notification.service");

const syncTeamMembersToProject = async (projectId, teamId, transaction) => {
  if (!teamId || !projectId) return;

  try {
    // 1. Lấy tất cả user_id của thành viên trong Team
    const teamWithMembers = await db.Team.findByPk(teamId, {
      include: [
        {
          model: db.User,
          as: "members",
          attributes: ["user_id"],
          through: { attributes: [] }, // Chỉ cần user_id, không cần thông tin bảng trung gian
        },
      ],
      transaction,
    });

    if (
      !teamWithMembers ||
      !teamWithMembers.members ||
      teamWithMembers.members.length === 0
    ) {
      console.warn(
        `Team (id: ${teamId}) không có thành viên hoặc không tìm thấy.`
      );
      return;
    }

    const teamMemberIds = teamWithMembers.members.map((m) => m.user_id);

    // 2. Lấy các thành viên "hiện tại" của dự án (từ bảng ProjectMember)
    //    để tránh thêm trùng lặp
    const existingMembers = await db.ProjectMember.findAll({
      where: { project_id: projectId },
      attributes: ["user_id"],
      transaction,
    });
    const existingMemberIds = new Set(existingMembers.map((m) => m.user_id));

    // 3. Lọc ra các thành viên mới cần thêm
    const newMembersData = teamMemberIds
      .filter((userId) => !existingMemberIds.has(userId)) // Chỉ thêm nếu user đó chưa có trong dự án
      .map((userId) => ({
        project_id: projectId,
        user_id: userId,
      }));

    // 4. Thêm thành viên mới vào ProjectMember
    if (newMembersData.length > 0) {
      await db.ProjectMember.bulkCreate(newMembersData, {
        transaction,
        ignoreDuplicates: true, // Thêm để an toàn, mặc dù đã filter
      });
    }
  } catch (error) {
    console.error("Lỗi khi đồng bộ thành viên team vào dự án:", error.message);
    throw new Error("Lỗi đồng bộ thành viên team: " + error.message);
  }
};

// create a new project
const createProject = async (projectData, requester) => {
  const t = await db.sequelize.transaction();

  try {
    const {
      project_name,
      team_id,
      description,
      status,
      start_date,
      due_date,
      client,
      budget,
      priority,
      owner_id: formOwnerId, // Lấy ID owner từ form (nếu có)
    } = projectData;
    if (!project_name || !start_date || !due_date) {
      throw new Error(
        "Thiếu thông tin bắt buộc: Tên dự án, Ngày bắt đầu hoặc Ngày kết thúc"
      );
    }

    const finalOwnerId = formOwnerId || requester?.user_id;

    if (!finalOwnerId) {
      throw new Error("Không xác định được người quản lý dự án");
    }

    // 3. Tạo Project
    const newProject = await Project.create(
      {
        project_name,
        owner_id: finalOwnerId, // Người được gán làm chủ
        team_id: team_id || null,
        description: description || "",
        status: status || "to_do",
        priority: priority || "medium",
        start_date,
        due_date,
        client: client || null,
        budget: budget || 0,
        created_by: requester?.user_id, // Lưu vết người bấm nút tạo (Admin)
      },
      { transaction: t }
    );

    // 4. Thêm Owner vào bảng ProjectMember
    await ProjectMember.create(
      {
        project_id: newProject.project_id,
        user_id: finalOwnerId,
        role: "owner",
      },
      { transaction: t }
    );

    // 5. Sync thành viên từ Team (nếu chọn Team)
    if (newProject.team_id) {
      await syncTeamMembersToProject(
        newProject.project_id,
        newProject.team_id,
        t
      );
    }

    // 6. Tạo nhóm Chat cho dự án
    const newConversation = await chatService.createProjectChat(
      newProject.project_id,
      newProject.project_name,
      finalOwnerId,
      t
    );

    // 7. Add thành viên dự án vào nhóm Chat
    const projectMembers = await ProjectMember.findAll({
      where: { project_id: newProject.project_id },
      attributes: ["user_id"],
      transaction: t,
    });

    const participantRows = projectMembers
      .map((pm) => pm.user_id)
      .filter((uid) => uid != null)
      .map((uid) => ({ conve_id: newConversation.conve_id, user_id: uid }));

    if (participantRows.length) {
      await ConversationParticipant.bulkCreate(participantRows, {
        transaction: t,
        ignoreDuplicates: true,
      });
    }

    // 8. Log hoạt động
    await logActivity({
      user_id: requester?.user_id,
      entity_type: "project",
      entity_id: newProject.project_id,
      action: "created",
      description: `Tạo dự án: ${newProject.project_name} (Owner: ${finalOwnerId})`,
      tx: t,
    });

    await t.commit();
    return newProject;
  } catch (error) {
    await t.rollback();
    console.error("Lỗi tạo dự án (Service):", error.message);
    throw error;
  }
};

// Update a project
const updateProject = async (projectId, userId, projectData) => {
  const t = await sequelize.transaction();

  try {
    const projectToUpdate = await Project.findByPk(projectId, {
      transaction: t,
    });

    if (!projectToUpdate) {
      await t.rollback();
      return null;
    }
    const requesterUser = await User.findByPk(userId, {
      include: [
        {
          model: db.Role,
          as: "roles",
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
      transaction: t,
    });

    const isAdmin =
      requesterUser &&
      requesterUser.roles &&
      requesterUser.roles.some((r) => r.name === "admin");

    // 2. Kiểm tra xem user có phải là Owner của dự án không?
    const userPermission = await ProjectMember.findOne({
      where: { project_id: projectId, user_id: userId },
      attributes: ["role"],
      transaction: t,
    });

    const isOwner = userPermission && userPermission.role === "owner";

    if (!isAdmin && !isOwner) {
      // (Tuỳ chọn) Nếu bạn muốn cho phép thành viên bình thường cập nhật trạng thái (ví dụ: in_progress),
      // bạn có thể mở rộng logic ở đây. Nhưng với hành động "Hoàn thành dự án", thường chỉ Owner/Admin mới được làm.
      throw new Error(
        "Bạn không có quyền cập nhật dự án này (Chỉ Owner hoặc Admin)."
      );
    }
    // Đồng bộ thành viên nếu team_id được cập nhật
    const oldTeamId = projectToUpdate.team_id;
    const newTeamId = projectData.team_id;

    // Nếu team_id được gán mới hoặc bị thay đổi
    if (newTeamId && newTeamId !== oldTeamId) {
      await syncTeamMembersToProject(
        projectId,
        newTeamId,
        t // Dùng chung transaction
      );
    }

    // đổi status thành 'completed'
    if (projectData.status === "completed") {
      projectData.progressPercent = 100;

      // Tự động cập nhật tất cả tasks con thành 'completed'
      await Task.update(
        { status: "completed", progress: 100 },
        {
          where: { project_id: projectId },
          transaction: t,
        }
      );
    }

    const updatedProject = await projectToUpdate.update(projectData, {
      transaction: t,
    });

    await t.commit();
    return updatedProject;
  } catch (error) {
    await t.rollback();
    console.error("Lỗi cập nhật dự án (Service):", error);
    throw error;
  }
};

// delete projects
const deleteProject = async (project_id, user_id) => {
  const t = await sequelize.transaction();
  try {
    const project = await Project.findByPk(project_id, { transaction: t });
    if (!project) {
      await t.rollback();
      return null; // Project not found
    }

    const userPermission = await ProjectMember.findOne({
      where: { project_id, user_id },
      attributes: ["role"],
      transaction: t,
    });

    if (!userPermission || userPermission.role !== "owner") {
      // rollback and throw — không commit
      await t.rollback();
      throw new Error("Chỉ 'owner' của dự án mới có quyền xoá.");
    }

    // xóa project trong cùng transaction
    await project.destroy({ transaction: t });

    // commit khi mọi thứ OK
    await t.commit();

    // trả về thông tin rõ ràng — dùng đúng biến project_id
    return {
      message: "Dự án đã được xóa thành công",
      projectId: project_id,
      projectName: project.project_name,
    };
  } catch (error) {
    // rollback only if transaction not finished (commit/rollback)
    try {
      if (!t.finished) {
        await t.rollback();
      } else {
        // t.finished can be 'commit' or 'rollback'
        console.warn(`Transaction already finished with state: ${t.finished}`);
      }
    } catch (rbErr) {
      // nếu rollback thất bại, log để debug, nhưng không che lỗi gốc
      console.error("Rollback failed:", rbErr);
    }

    console.error("Lỗi xóa dự án(Service):", error);
    throw error;
  }
};

// delete by admin
const deleteProjectByAdmin = async (project_id) => {
  const t = await sequelize.transaction();

  try {
    // 1. Kiểm tra dự án có tồn tại không
    const project = await Project.findByPk(project_id, {
      transaction: t,
      attributes: ["project_id", "project_name", "owner_id"],
    });

    if (!project) {
      await t.rollback();
      throw new Error("Dự án không tồn tại hoặc đã bị xóa trước đó");
    }
    // xoá các dữ liệu liên quan trong cùng transaction
    // // Xóa comment của task
    // await TaskComment.destroy({
    //   where: { task_id },
    //   transaction: t,
    //   force: true,
    // });

    // Xóa task
    await Task.destroy({
      where: { project_id },
      transaction: t,
      force: true,
    });

    // Xóa thành viên dự án
    await ProjectMember.destroy({
      where: { project_id },
      transaction: t,
    });

    // Xóa activity log
    await Activity.destroy({
      where: { entity_type: "project", entity_id: project_id },
      transaction: t,
    });

    // Xóa nhóm chat + participant (nếu bạn dùng bảng Conversation & ConversationParticipant)
    const conversation = await Conversation.findOne({
      where: { project_id },
      transaction: t,
    });

    if (conversation) {
      await ConversationParticipant.destroy({
        where: { conve_id: conversation.conve_id },
        transaction: t,
      });
      await conversation.destroy({ transaction: t });
    }

    await project.destroy({ transaction: t });
    await t.commit();
    return {
      success: true,
      message: "Xóa dự án và toàn bộ dữ liệu liên quan thành công (Admin)",
      deletedProject: {
        project_id: project.project_id,
        project_name: project.project_name,
        deletedAt: new Date(),
      },
    };
  } catch (error) {
    if (!t.finished) await t.rollback().catch(() => {});
    console.error("Lỗi xóa dự án bởi Admin (Service):", error.message || error);
    throw error;
  }
};

// Get all projects (role: admin)
const getAllProjects = async () => {
  try {
    const projects = await db.Project.findAll({
      include: [
        // 1. Lấy thông tin Owner (Người tạo)
        {
          model: db.User,
          as: "owner",
          attributes: [
            "user_id",
            "username",
            "email",
            "full_name",
            "avatar_url",
          ], // Nên lấy thêm avatar
        },

        // 2. Lấy thông tin Team (Nhóm)
        {
          model: db.Team,
          as: "team",
          attributes: ["team_id", "team_name"],
        },
        {
          model: db.Task,
          as: "tasks",
          attributes: [
            "task_id",
            "task_name",
            "status",
            "priority",
            "start_date",
            "due_date",
          ],
        },
        {
          model: db.User,
          as: "members",
          attributes: [
            "user_id",
            "username",
            "full_name",
            "avatar_url",
            "email",
          ],
          through: {
            attributes: ["role", "joined_at"],
          },
        },
      ],

      order: [["created_at", "DESC"]],
    });
    const stats = await db.Project.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("project_id")), "total"],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              `CASE WHEN status = 'completed' THEN 1 ELSE 0 END`
            )
          ),
          "completed",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(`CASE WHEN status = 'over_due' THEN 1 ELSE 0 END`)
          ),
          "over_due",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              `CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END`
            )
          ),
          "in_progress",
        ],
      ],
    });

    return { projects, stats: stats[0] };
  } catch (error) {
    console.error("Lỗi lấy danh sách dự án (Service):", error);
    throw error;
  }
};

// get projects by user id
const getProjectsByUserId = async (userId) => {
  try {
    const projects = await Project.findAll({
      where: {
        [Op.or]: [
          // { owner_id: userId }, // Bỏ check owner_id cũ
          { "$members.user_id$": userId }, // 1. User là thành viên trực tiếp (project_members)
          { "$team.members.user_id$": userId }, // 2. User là thành viên của team (chưa sync)
        ],
      },
      include: [
        {
          model: db.User,
          as: "owner", // Owner (người tạo)
          attributes: ["user_id", "username", "email", "full_name"],
          required: false,
        },
        {
          // ============ SỬA CHỖ NÀY ============
          model: db.User,
          as: "members", // Thành viên TRỰC TIẾP
          attributes: ["user_id", "username", "avatar_url"],
          through: {
            model: db.ProjectMember, // 1. Phải dùng Model
            attributes: ["role"], // 2. Lấy thêm role
          },
          required: false,
          // ======================================
        },
        {
          model: db.Team,
          as: "team", // Team
          attributes: ["team_id", "team_name"],
          required: false,
          include: [
            {
              model: db.User,
              as: "members", // Thành viên GIÁN TIẾP (qua team)
              attributes: ["user_id", "username", "avatar_url"],
              through: {
                model: db.TeamMember, // 1. Phải dùng Model
                attributes: [],
              },
              required: false,
              // ======================================
            },
          ],
        },
        {
          model: db.Task,
          as: "tasks",
          attributes: ["task_id", "status"],
          required: false,
          include: [
            {
              model: db.Attachment,
              as: "attachments",
              attributes: ["attach_id"],
              required: false,
            },
          ],
        },
        {
          model: db.Activity,
          as: "activities",
          attributes: ["activity_id"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
      distinct: true,
    });
    return processProjects(projects);
  } catch (error) {
    console.error("Lỗi lấy dự án theo user_id (Service):", error);
    throw error;
  }
};

// get status
const getStatus = async () => {
  try {
    const statuses = await Project.rawAttributes.status.values;
    return statuses;
  } catch (error) {
    console.error("Lỗi lấy trạng thái dự án (Service):", error);
    throw error;
  }
};

// get priorities
const getPriorities = async () => {
  try {
    const priorities = await Task.rawAttributes.priority.values;
    return priorities;
  } catch (error) {
    console.error("Lỗi lấy mức độ ưu tiên (Service):", error);
    throw error;
  }
};

// get project by id
const getProjectById = async (projectId, userId) => {
  try {
    const project = await Project.findOne({
      where: {
        project_id: projectId, // chỉ filter theo id dự án, không giới hạn owner
      },
      include: [
        {
          model: db.User,
          as: "owner", // Người sở hữu dự án
          attributes: ["user_id", "username", "email", "full_name"],
        },
        {
          model: db.Team,
          as: "team", // Team được gán
          attributes: ["team_id", "team_name"],
          include: [
            {
              model: db.User,
              as: "members",
              attributes: ["user_id"],
              through: { attributes: [] },
            },
          ],
        },
        {
          model: db.User,
          as: "members", // thành viên của project (project_member)
          attributes: ["user_id", "username", "avatar_url", "full_name"],
          through: { attributes: [] },
        },
        {
          model: db.Conversation,
          as: "conversation",
          attributes: ["conve_id", "title", "type"],
          required: false,
        },
        {
          model: db.Task,
          as: "tasks", // Lấy các task liên quan
          attributes: [
            "task_id",
            "task_name",
            "description",
            "status",
            "priority",
            "start_date",
            "due_date",
            "created_at",
            "updated_at",
          ],
          include: [
            {
              model: db.Attachment,
              as: "attachments", // Lấy các attachment của task
              attributes: ["attach_id", "file_name", "file_url"],
            },
          ],
          include: [
            {
              model: db.User,
              as: "assignees",
              attributes: ["user_id", "username", "avatar_url"],
              through: { attributes: [] },
            },
          ],
        },
        {
          model: db.Activity,
          as: "activities", // Lấy các hoạt động liên quan đến dự án
          attributes: ["activity_id"],
        },
      ],
    });

    if (!project) {
      throw new Error("Không tìm thấy dự án.");
    }

    // Quyền truy cập: owner OR thành viên project OR thành viên team
    const projectJSON = project.toJSON();

    const isOwner =
      projectJSON.owner && String(projectJSON.owner.user_id) === String(userId);

    const isProjectMember =
      Array.isArray(projectJSON.members) &&
      projectJSON.members.some((m) => String(m.user_id) === String(userId));

    // Kiểm tra team members nếu team được include và có mảng members
    const isTeamMember =
      projectJSON.team &&
      Array.isArray(projectJSON.team.members) &&
      projectJSON.team.members.some(
        (m) => String(m.user_id) === String(userId)
      );

    if (!(isOwner || isProjectMember || isTeamMember)) {
      throw new Error("Bạn không có quyền truy cập dự án này.");
    }

    return processProjects([project])[0];
  } catch (error) {
    console.error("Lỗi lấy dự án theo project_id (Service):", error);
    throw error;
  }
};

const processProjects = (projects) => {
  if (!projects) return [];

  return projects.map((p) => {
    const project = p.toJSON();

    const taskCount = p.tasks ? p.tasks.length : 0;

    const attachmentCount = p.tasks
      ? p.tasks.reduce((sum, task) => {
          return sum + (task.attachments ? task.attachments.length : 0);
        }, 0)
      : 0; // 3. Đếm Activities
    const activityCount = p.activities ? p.activities.length : 0; // 4. Tính tiến độ dựa trên số task đã hoàn thành

    let progressPercent = 0;
    if (taskCount > 0) {
      const completedTasks = p.tasks.filter(
        (t) => t.status === "completed"
      ).length;
      progressPercent = Math.round((completedTasks / taskCount) * 100);
    }

    return {
      ...project,
      taskCount,
      attachmentCount,
      activityCount,
      progressPercent,
    };
  });
};

const getProjectMembers = async (projectId) => {
  try {
    const members = await ProjectMember.findAll({
      where: { project_id: projectId },
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "user_id",
            "username",
            "full_name",
            "email",
            "avatar_url",
          ],
        },
      ],
    });

    return members.map((pm) => {
      // pm.user có thể null nếu user bị xóa -> tránh crash
      const userObj =
        pm.user && typeof pm.user.toJSON === "function"
          ? pm.user.toJSON()
          : pm.user || {};

      return {
        ...userObj,
        role: pm.role, // role nằm trên ProjectMember
        joined_at: pm.joined_at,
      };
    });
  } catch (error) {
    console.error("Lỗi lấy thành viên dự án (Service):", error);
    throw error;
  }
};

// invite member to project
// const inviteMemberToProject = async (
//   projectId,
//   requestingUserId,
//   memberEmail
// ) => {
//   const t = await sequelize.transaction();
//   try {
//     // 1. Kiểm tra email đầu vào
//     if (!memberEmail) {
//       throw new Error("Vui lòng cung cấp email thành viên.");
//     }

//     // 2. Kiểm tra quyền: Người mời phải là Owner (hoặc Admin tùy logic bro)
//     const inviterPermission = await ProjectMember.findOne({
//       where: { project_id: projectId, user_id: requestingUserId },
//       attributes: ["role"],
//       transaction: t,
//     });

//     // Check null trước khi check role để tránh crash
//     if (!inviterPermission || inviterPermission.role !== "owner") {
//       throw new Error("Bạn không có quyền mời thành viên vào dự án này.");
//     }

//     // 3. Tìm người dùng cần mời qua Email
//     const userToInvite = await User.findOne({
//       where: { email: memberEmail },
//       attributes: ["user_id", "username", "full_name", "email"],
//       transaction: t,
//     });

//     if (!userToInvite) {
//       throw new Error("Không tìm thấy người dùng với email này trên hệ thống.");
//     }

//     // 4. Kiểm tra xem người đó đã trong dự án chưa
//     const existingMember = await ProjectMember.findOne({
//       where: {
//         project_id: projectId,
//         user_id: userToInvite.user_id,
//       },
//       transaction: t,
//     });

//     if (existingMember) {
//       throw new Error("Người dùng này đã là thành viên của dự án.");
//     }

//     // 5. Thêm vào dự án (mặc định role là member)
//     const newProjectMember = await ProjectMember.create(
//       {
//         project_id: projectId,
//         user_id: userToInvite.user_id,
//         role: "member",
//         joined_at: new Date(), // Thêm thời gian join cho chuẩn
//       },
//       { transaction: t }
//     );

//     // --- UPDATE: Lấy thông tin Project để bắn thông báo ---
//     const project = await Project.findByPk(projectId, {
//       attributes: ["project_id", "project_name"],
//       transaction: t,
//     });

//     // 6. BẮN THÔNG BÁO (Notification)
//     if (project) {
//       await NotificationService.notifyProjectInvite(
//         requestingUserId, // Người mời
//         userToInvite.user_id, // Người được mời
//         project, // Info dự án (để lấy tên hiển thị)
//         t
//       );
//     }

//     // 7. LOG HOẠT ĐỘNG (Activity)
//     // Sửa lại cách truyền transaction 't' cho đúng với activity.service.js
//     await logActivity(
//       {
//         user_id: requestingUserId,
//         entity_type: "project",
//         entity_id: projectId,
//         action: "invited",
//         description: `Đã mời thành viên ${userToInvite.email} vào dự án.`,
//       },
//       t
//     ); // <--- 't' là tham số thứ 2

//     await t.commit();

//     return {
//       ...userToInvite.toJSON(),
//       role: newProjectMember.role,
//     };
//   } catch (error) {
//     await t.rollback();
//     console.error("Lỗi mời thành viên (Service):", error.message);
//     throw error;
//   }
// };

const inviteMemberToProject = async (
  projectId,
  requestingUserId,
  memberEmail
) => {
  const t = await sequelize.transaction();
  try {
    if (!memberEmail) {
      throw new Error("Vui lòng cung cấp email thành viên.");
    }
    const requesterUser = await User.findByPk(requestingUserId, {
      include: [
        {
          model: db.Role,
          as: "roles", // Khớp với alias trong User.model.js: User.belongsToMany(..., { as: "roles" })
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
      transaction: t,
    });

    // Kiểm tra trong mảng roles có 'admin' hoặc 'super_admin' không
    const isAdmin =
      requesterUser &&
      requesterUser.roles &&
      requesterUser.roles.some(
        (r) => r.name === "admin" || r.name === "super_admin"
      );

    // Bước B: Nếu KHÔNG PHẢI Admin, thì bắt buộc phải là Owner của dự án đó
    if (!isAdmin) {
      const projectPermission = await ProjectMember.findOne({
        where: {
          project_id: projectId,
          user_id: requestingUserId,
          role: "owner",
        },
        transaction: t,
      });

      if (!projectPermission) {
        throw new Error(
          "Bạn không có quyền mời thành viên (Chỉ Admin hoặc Owner dự án mới được mời)."
        );
      }
    }
    // --- KẾT THÚC LOGIC CHECK QUYỀN ---

    // 2. Tìm người dùng cần mời qua Email
    const userToInvite = await User.findOne({
      where: { email: memberEmail },
      attributes: ["user_id", "username", "full_name", "email", "avatar_url"],
      transaction: t,
    });

    if (!userToInvite) {
      throw new Error(`Không tìm thấy người dùng với email: ${memberEmail}`);
    }

    // 3. Kiểm tra xem người đó đã trong dự án chưa
    const existingMember = await ProjectMember.findOne({
      where: {
        project_id: projectId,
        user_id: userToInvite.user_id,
      },
      transaction: t,
    });

    if (existingMember) {
      throw new Error("Người dùng này đã là thành viên của dự án.");
    }

    // 4. Thêm vào ProjectMember (Mặc định role là 'member')
    const newProjectMember = await ProjectMember.create(
      {
        project_id: projectId,
        user_id: userToInvite.user_id,
        role: "member",
        joined_at: new Date(),
      },
      { transaction: t }
    );

    // 5. Lấy thông tin Project để bắn thông báo
    const project = await Project.findByPk(projectId, {
      attributes: ["project_id", "project_name"],
      transaction: t,
    });

    // 6. Bắn thông báo (Notification)
    if (project) {
      await NotificationService.notifyProjectInvite(
        requestingUserId, // Người mời (Có thể là Admin hoặc Owner)
        userToInvite.user_id, // Người được mời
        project,
        t
      );
    }

    // 7. Log hoạt động
    await logActivity(
      {
        user_id: requestingUserId,
        entity_type: "project",
        entity_id: projectId,
        action: "invited",
        description: `Đã mời thành viên ${userToInvite.email} vào dự án ${
          project ? project.project_name : ""
        }.`,
      },
      t
    );

    await t.commit();

    // Trả về data user để frontend hiển thị ngay lập tức
    return {
      ...userToInvite.toJSON(),
      role: newProjectMember.role,
      joined_at: newProjectMember.joined_at,
    };
  } catch (error) {
    await t.rollback();
    console.error("Lỗi mời thành viên (Service):", error.message);
    throw error;
  }
};

// lấy project gần đây
const getRecentProjects = async (userId) => {
  try {
    const projects = await Project.findAll({
      // Chỉ lấy các trường cần thiết
      attributes: ["project_id", "project_name", "status", "updated_at"],
      include: [
        {
          model: User,
          as: "members",
          where: { user_id: userId }, // Điều kiện: User phải là thành viên
          attributes: [], // Không cần lấy thông tin user trong bảng join
        },
      ],
      order: [["updated_at", "DESC"]], // Sắp xếp theo thời gian cập nhật mới nhất
      limit: 3, // Lấy 3 cái thôi
    });

    return projects;
  } catch (error) {
    console.error("Error fetching recent projects:", error);
    return [];
  }
};

module.exports = {
  createProject,
  updateProject,
  deleteProject,
  deleteProjectByAdmin,
  getStatus,
  getPriorities,
  getAllProjects,
  getProjectsByUserId,
  getProjectById,
  getProjectMembers,
  inviteMemberToProject,
  getRecentProjects,
};
