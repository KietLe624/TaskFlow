const db = require("../models/index.model");
const {
  Team,
  User,
  TeamMember,
  Conversation,
  ConversationParticipant,
  Task,
  Project,
  Role,
} = db;
const chatService = require("./chat.service");
const NotificationService = require("./notification.service");
const { logActivity } = require("./activity.service");
const { Op } = require("sequelize");

// create team
const createTeam = async ({ team_name, owner_team_id }) => {
  try {
    const user = await User.findByPk(owner_team_id);
    if (!user) throw new Error("Người dùng không tồn tại");

    const newTeam = await Team.create({
      team_name: team_name.trim(),
      owner_team_id,
    });

    await db.TeamMember.create({
      team_id: newTeam.team_id,
      user_id: owner_team_id,
      role: "owner",
    });

    await chatService.createConversation(
      newTeam.team_id,
      team_name,
      owner_team_id
    );

    return newTeam;
  } catch (error) {
    console.error("Lỗi khi tạo team (Service):", error.message);
    throw error;
  }
};

// create team admin
const createTeamAdmin = async ({ team_name, owner_team_id }) => {
  try {
    const user = await User.findByPk(owner_team_id);
    if (!user) throw new Error("Người dùng không tồn tại");

    const newTeam = await Team.create({
      team_name: team_name.trim(),
      owner_team_id,
    });

    await db.TeamMember.create({
      team_id: newTeam.team_id,
      user_id: owner_team_id,
      role: "owner",
    });

    // Tạo conversation (nếu cần)
    await chatService.createConversation(
      newTeam.team_id,
      team_name,
      owner_team_id
    );

    return newTeam;
  } catch (error) {
    console.error("Lỗi khi tạo team (Service):", error.message);
    throw error;
  }
};

// update team
const updateTeam = async (teamData) => {
  try {
    const { team_id, team_name, owner_team_id } = teamData;

    // Tìm nhóm
    const team = await Team.findByPk(team_id);
    if (!team) throw new Error("Nhóm không tồn tại");

    // Kiểm tra quyền
    if (team.owner_team_id !== owner_team_id) {
      throw new Error("Bạn không có quyền chỉnh sửa nhóm này");
    }

    team.team_name = team_name.trim();
    await team.save();
    return team;
  } catch (error) {
    console.error("Lỗi khi cập nhật team (Service):", error.message);
    throw error;
  }
};

const deleteTeam = async ({ team_id, owner_team_id }) => {
  try {
    // Tìm nhóm
    const team = await Team.findByPk(team_id);
    if (!team) throw new Error("Nhóm không tồn tại");

    // Kiểm tra quyền
    if (team.owner_team_id !== owner_team_id) {
      throw new Error("Bạn không có quyền xóa nhóm này");
    }

    await team.destroy();
    return { message: "Xóa nhóm thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa team (Service):", error.message);
    throw error;
  }
};
// get all teams admin
const getAllTeams = async () => {
  const teams = await db.Team.findAll({
    attributes: ["team_id", "team_name", "created_at"],
    include: [
      {
        model: db.User,
        as: "owner", // truy xuất sau bằng team.owner
        attributes: ["user_id", "username", "full_name", "avatar_url"],
      },
      {
        model: db.TeamMember,
        as: "teamMemberships", // lưu ý: 'as' phải trùng với cách truy cập bên dưới
        attributes: ["user_id"],
        include: [
          {
            model: db.User,
            as: "user", // truy xuất sau bằng tm.user
            attributes: ["username", "full_name", "avatar_url"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // chuyển thành plain object để truy xuất an toàn (tránh getter của sequelize)
  return teams.map((team) => {
    const t = team.get ? team.get({ plain: true }) : team;

    return {
      team_id: t.team_id,
      team_name: t.team_name,
      created_at: t.created_at,
      owner_name: t.owner?.full_name || t.owner?.username || "Unknown",
      owner_username: t.owner?.username || null,
      owner_avatar: t.owner?.avatar_url || null,
      member_count: t.teamMemberships?.length || 0,
      members:
        t.teamMemberships?.map((tm) => ({
          user_id: tm.user_id,
          username: tm.user?.username || null,
          full_name: tm.user?.full_name || tm.user?.username || null,
          avatar_url: tm.user?.avatar_url || null,
        })) ?? [],
    };
  });
};

// get all teams by owner_team_id
const getAllTeamsByOwner = async (owner_team_id) => {
  try {
    return await Team.findAll({
      where: { owner_team_id },
      include: [
        {
          model: User,
          as: "members", // Phải khớp với alias trong Team.associate
          attributes: ["user_id", "username", "full_name", "avatar_url"], // Chỉ lấy các trường cần thiết
          through: {
            attributes: ["user_id", "role"],
          },
        },
      ],
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nhóm (Service):", error.message);
    throw error;
  }
};

// get team members
const getTeamMembers = async (team_id) => {
  try {
    const team = await Team.findByPk(team_id, {
      include: [
        {
          model: User,
          as: "members",
          attributes: ["user_id", "username", "email", "phone_number"],
          through: { attributes: [] },
        },
      ],
    });

    if (!team) throw new Error("Nhóm không tồn tại");

    const conversation = await Conversation.findOne({
      where: { team_id: team_id, type: "team" },
      attributes: ["conve_id"], // Chỉ lấy ID
    });
    return {
      team: team,
      conversation_id: conversation ? conversation.conve_id : null,
    };
  } catch (error) {
    console.error("Lỗi khi lấy thành viên nhóm (Service):", error.message);
    throw error;
  }
};

// overview of team
const getTeamOverview = async (team_id, user_id) => {
  try {
    const team = await Team.findByPk(team_id, {
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["user_id", "username", "full_name", "avatar_url"],
        },
        {
          model: User,
          as: "members",
          attributes: [
            "user_id",
            "username",
            "full_name",
            "email",
            "avatar_url",
          ],
          through: { attributes: [] },
          include: [
            {
              model: db.TeamMember,
              as: "teamMemberships",
              where: { team_id },
              attributes: ["role"],
            },
          ],
        },
        {
          model: db.Project,
          as: "projects",
          attributes: [
            "project_id",
            "description",
            "project_name",
            "status",
            "created_at",
            "due_date",
          ],
        },
      ],
    });

    if (!team) throw new Error("Team không tồn tại");

    // Kiểm tra quyền truy cập
    const isMember = team.members.some((m) => m.user_id === user_id);
    const isOwner = team.owner_team_id === user_id;
    if (!isMember && !isOwner) {
      throw new Error("Bạn không có quyền truy cập team này");
    }

    // Đếm task
    const totalTasks = await Task.count({
      include: [
        {
          model: Project,
          as: "project",
          where: { team_id },
          attributes: [],
        },
      ],
    });
    // Đếm task đã hoàn thành
    const completedTasks = await Task.count({
      where: { status: "completed" },
      include: [
        {
          model: Project,
          as: "project",
          where: { team_id },
          attributes: [],
        },
      ],
    });

    return {
      team: {
        team_id: team.team_id,
        team_name: team.team_name,
        created_at: team.created_at,
        owner: team.owner,
      },
      stats: {
        members: team.members.length,
        projects: team.projects.length,
        totalTasks,
        completedTasks,
        completionRate:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      members: team.members,
      projects: team.projects,
    };
  } catch (error) {
    console.error("Lỗi trong getTeamOverview service:", error);
    throw error; // bắt buộc throw để controller catch
  }
};

// get team project
const getTeamProjects = async (team_id) => {
  try {
    const team = await Team.findByPk(team_id, {
      include: [
        {
          model: Project,
          as: "projects",
          attributes: [
            "project_id",
            "project_name",
            "status",
            "due_date",
            "created_at",
          ],
          include: [
            {
              model: User,
              as: "owner",
              attributes: ["user_id", "username", "full_name"],
            },
          ],
        },
      ],
    });

    if (!team) throw new Error("Team không tồn tại");
    return team.projects || [];
  } catch (error) {
    throw error;
  }
};

// invite member to team
const inviteMember = async ({ team_id, email, owner_team_id }) => {
  try {
    // 1. Kiểm tra team tồn tại
    const team = await Team.findByPk(team_id);
    if (!team) throw new Error("Nhóm không tồn tại");

    // 2. Kiểm tra quyền (chỉ owner mời được)
    // Lưu ý: Đảm bảo kiểu dữ liệu so sánh (string vs number) là giống nhau
    if (Number(team.owner_team_id) !== Number(owner_team_id)) {
      throw new Error("Bạn không có quyền mời thành viên vào nhóm này");
    }

    // 3. Kiểm tra user tồn tại bằng EMAIL
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Người dùng với email này không tồn tại");

    // --- 🔥 QUAN TRỌNG: Lấy user_id từ user vừa tìm được ---
    const user_id = user.user_id; // (Hoặc user.id tùy vào model của bạn)

    // 4. Kiểm tra user đã trong team chưa
    // Bây giờ biến user_id mới có giá trị để dùng
    const exists = await TeamMember.findOne({ where: { team_id, user_id } });
    if (exists) throw new Error("Người dùng này đã là thành viên của nhóm");

    // 5. Thêm vào team_members
    await TeamMember.create({
      team_id,
      user_id, // Dùng biến user_id vừa lấy
      role: "member",
    });
    // 6. Tìm conversation của team
    const conversation = await Conversation.findOne({
      where: { team_id, type: "team" },
    });

    // Chỉ thêm vào chat nếu tìm thấy phòng chat (tránh lỗi crash nếu không có phòng chat)
    if (conversation) {
      // Kiểm tra xem đã trong đoạn chat chưa để tránh duplicate key
      const inChat = await ConversationParticipant.findOne({
        where: { conve_id: conversation.conve_id, user_id },
      });

      if (!inChat) {
        await ConversationParticipant.create({
          conve_id: conversation.conve_id,
          user_id,
          role: "member",
        });
      }
    }
    // 7. Gửi notification (nếu cần)
    await NotificationService.createNotification({
      user_id,
      type: "invited",
      message: `Bạn đã được mời vào nhóm "${team.team_name}"`,
      metadata: { team_id, team_name: team.team_name },
    });
    // log activity
    await logActivity(
      {
        user_id: owner_team_id,
        entity_type: "team",
        entity_id: team_id,
        action: "invited",
        description: `Đã mời ${email} vào nhóm`,
      },
      null
    );
    return {
      success: true,
      message: "Mời thành viên thành công",
      data: { team_id, user_id, email },
    };
  } catch (error) {
    console.error("Lỗi khi mời thành viên (Service):", error.message);
    // Ném lỗi ra để Controller bắt được
    throw error;
  }
};

// delete member from team (only owner can delete)
const removeMember = async ({ team_id, user_id, owner_team_id }) => {
  try {
    // Kiểm tra team tồn tại
    const team = await Team.findByPk(team_id);
    if (!team) throw new Error("Nhóm không tồn tại");
    // Kiểm tra quyền member
    const member = await TeamMember.findOne({
      where: { team_id, user_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "username", "email", "full_name"],
        },
      ],
    });
    if (!member) throw new Error("Thành viên không tồn tại trong nhóm");
    if (team.owner_team_id !== owner_team_id || member.role === "admin") {
      throw new Error("Bạn không có quyền xoá thành viên này");
    }
    // Xoá khỏi team_members
    await member.destroy();

    // Tìm conversation của team
    const conversation = await Conversation.findOne({
      where: { team_id },
    });
    if (!conversation) throw new Error("Không tìm thấy phòng chat của nhóm");

    await ConversationParticipant.destroy({
      where: { conve_id: conversation.conve_id, user_id },
    });

    return { team_id, user_id };
  } catch (error) {
    console.error("Lỗi khi xoá thành viên (Service):", error.message);
    throw error;
  }
};

// remove member by admin
const removeMemberWithAdmin = async ({ team_id, user_id }) => {
  try {
    const team = await Team.findByPk(team_id);
    if (!team) throw new Error("Nhóm không tồn tại");

    await TeamMember.destroy({
      where: { team_id, user_id },
    });

    // Xóa khỏi conversation nếu cần
    const conversation = await Conversation.findOne({ where: { team_id } });
    if (conversation) {
      await ConversationParticipant.destroy({
        where: { conve_id: conversation.conve_id, user_id },
      });
    }

    return { team_id, user_id };
  } catch (error) {
    console.error("Lỗi xóa thành viên:", error.message);
    throw error;
  }
};

// change role member in team
const changeMemberRole = async ({
  team_id,
  user_id,
  new_role,
  owner_team_id,
}) => {
  try {
    // Kiểm tra team tồn tại
    const team = await Team.findByPk(team_id);
    if (!team) throw new Error("Nhóm không tồn tại");
    // Kiểm tra quyền member
    const member = await TeamMember.findOne({
      where: { team_id, user_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "username", "email", "full_name"],
        },
      ],
    });
    if (!member) throw new Error("Thành viên không tồn tại trong nhóm");
    if (team.owner_team_id !== owner_team_id) {
      throw new Error("Bạn không có quyền thay đổi vai trò thành viên này");
    }
    // Cập nhật vai trò
    member.role = new_role;
    await member.save();
    return { team_id, user_id, new_role };
  } catch (error) {
    console.error(
      "Lỗi khi thay đổi vai trò thành viên (Service):",
      error.message
    );
    throw error;
  }
};

module.exports = {
  createTeam,
  createTeamAdmin,
  updateTeam,
  deleteTeam,
  getAllTeams,
  getAllTeamsByOwner,
  getTeamMembers,
  getTeamOverview,
  getTeamProjects,
  inviteMember,
  removeMember,
  changeMemberRole,
  removeMemberWithAdmin,
};
