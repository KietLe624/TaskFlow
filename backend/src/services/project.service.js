const e = require("express");
const db = require("../models/index.model");
const { Op } = require("sequelize");
const { User, Project, Task, ProjectMember, sequelize } = db;
const { logActivity } = require("./activity.service");
const chatService = require("./chat.service");

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
const createProject = async (projectData, user) => {
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
    } = projectData;

    //  validate input
    if (!project_name || !start_date || !due_date) {
      throw new Error(
        "Thiếu thông tin bắt buộc: project_name, start_date hoặc due_date"
      );
    }

    const owner_id = user?.user_id;
    if (!owner_id) {
      throw new Error("Không tìm thấy thông tin người tạo (owner_id)");
    }

    //  tạo dự án mới
    const newProject = await Project.create(
      {
        project_name,
        owner_id, // Vẫn lưu owner_id gốc để biết ai tạo
        team_id: team_id || null,
        description: description || "",
        status: status || "to_do",
        priority: priority || "medium",
        start_date,
        due_date,
        client: client || null,
        budget: budget || 0,
      },
      { transaction: t }
    );

    await ProjectMember.create(
      {
        project_id: newProject.project_id,
        user_id: owner_id,
        role: "owner",
      },
      { transaction: t }
    );

    if (newProject.team_id) {
      await syncTeamMembersToProject(
        newProject.project_id,
        newProject.team_id,
        t
      );
    }

    const newConversation = await chatService.createProjectChat(
      newProject.project_id,
      newProject.project_name,
      owner_id,
      t
    );

    // Lấy danh sách project members (đã sync nếu team) và add vào conversation
    const projectMembers = await ProjectMember.findAll({
      where: { project_id: newProject.project_id },
      attributes: ["user_id"],
      transaction: t,
    });

    const participantRows = projectMembers
      .map((pm) => pm.user_id)
      .filter((user_id) => user_id != null)
      .map((user_id) => ({ conve_id: newConversation.conve_id, user_id }));

    if (participantRows.length) {
      await db.ConversationParticipant.bulkCreate(participantRows, {
        transaction: t,
        ignoreDuplicates: true,
      });
    }

    // log hoạt động
    await logActivity({
      user_id: owner_id,
      entity_type: "project",
      entity_id: newProject.project_id,
      action: "created",
      description: `Tạo dự án: ${newProject.project_name}`,
      tx: t,
    });

    await t.commit();
    return newProject;
  } catch (error) {
    await t.rollback();
    console.error(" Lỗi tạo dự án (Service):", error.message);
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
    // Kiểm tra quyền: chỉ 'owner' mới có quyền cập nhật
    const userPermission = await ProjectMember.findOne({
      where: { project_id: projectId, user_id: userId },
      attributes: ["role"],
      transaction: t,
    });

    if (!userPermission || userPermission.role !== "owner") {
      throw new Error("Chỉ 'owner' của dự án mới có quyền xoá.");
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

    // Nếu người dùng muốn đổi status thành 'completed'
    if (projectData.status === "completed") {
      projectData.progressPercent = 100; // Đảm bảo tên trường progressPercent đúng với model của bạn

      // Tự động cập nhật tất cả tasks con thành 'completed'
      await Task.update(
        { status: "completed", progress: 100 },
        {
          where: { project_id: projectId },
          transaction: t,
        }
      );
    }

    // Cập nhật project với dữ liệu mới (đã bao gồm logic completed ở trên nếu có)
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

    console.log("DEBUG deleteProject - userPermission:", userPermission);

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

// Get all projects (role: admin)
const getAllProjects = async () => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: db.User,
          as: "owner",
          attributes: ["user_id", "username", "email", "full_name"],
        },
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
      ],
      order: [["created_at", "DESC"]],
    });

    return projects;
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

const inviteMemberToProject = async (
  projectId,
  requestingUserId,
  memberEmail
) => {
  const t = await sequelize.transaction();
  try {
    // 1. Kiểm tra email đầu vào
    if (!memberEmail) {
      throw new Error("Vui lòng cung cấp email thành viên.");
    }

    // 2. Kiểm tra quyền: Người mời phải là Owner
    const inviterPermission = await ProjectMember.findOne({
      where: { project_id: projectId, user_id: requestingUserId },
      attributes: ["role"],
      transaction: t,
    });

    if (!inviterPermission || inviterPermission.role !== "owner") {
      throw new Error("Chỉ 'owner' của dự án mới có quyền mời thành viên.");
    }

    // 3. Tìm người dùng cần mời qua Email
    const userToInvite = await User.findOne({
      where: { email: memberEmail },
      attributes: ["user_id", "username", "full_name", "email"],
      transaction: t,
    });

    if (!userToInvite) {
      throw new Error("Không tìm thấy người dùng với email này trên hệ thống.");
    }

    // 4. Kiểm tra xem người đó đã trong dự án chưa
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

    // 5. Thêm vào dự án (mặc định role là member)
    const newProjectMember = await ProjectMember.create(
      {
        project_id: projectId,
        user_id: userToInvite.user_id,
        role: "member",
      },
      { transaction: t }
    );

    // 6. Log hoạt động
    await logActivity({
      user_id: requestingUserId, // Sửa lại key cho khớp model activity (user_id thay vì userId)
      entity_type: "project",
      entity_id: projectId,
      action: "invited",
      description: `Đã mời thành viên ${userToInvite.email} vào dự án.`,
      tx: t,
    });

    await t.commit();

    return {
      ...userToInvite.toJSON(),
      role: newProjectMember.role,
    };
  } catch (error) {
    await t.rollback();
    console.error("Lỗi mời thành viên (Service):", error.message);
    throw error;
  }
};

module.exports = {
  createProject,
  updateProject,
  deleteProject,
  getStatus,
  getPriorities,
  getAllProjects,
  getProjectsByUserId,
  getProjectById,
  getProjectMembers,
  inviteMemberToProject,
};
