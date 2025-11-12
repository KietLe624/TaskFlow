const db = require("../models/index.model");
const { Team, User, TeamMember, Conversation, ConversationParticipant } = db;
const chatService = require("./chat.service");

// Create Team
const createTeam = async ({ team_name, owner_team_id }) => {
  try {
    // Logic nghiệp vụ
    const user = await User.findByPk(owner_team_id);
    if (!user) throw new Error("Người dùng không tồn tại");

    const newTeam = await Team.create({
      team_name: team_name.trim(),
      owner_team_id,
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
// get all teams by owner_team_id
// ...
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
// ...

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

// invite member to team
const inviteMember = async ({ team_id, user_id, owner_team_id }) => {
  try {
    // Kiểm tra team tồn tại
    const team = await Team.findByPk(team_id);
    if (!team) throw new Error("Nhóm không tồn tại");

    //  Kiểm tra quyền (chỉ owner mời được)
    if (team.owner_team_id !== owner_team_id) {
      throw new Error("Bạn không có quyền mời thành viên vào nhóm này");
    }

    //  Kiểm tra user tồn tại
    const user = await User.findByPk(user_id);
    if (!user) throw new Error("Người dùng không tồn tại");

    //  Kiểm tra user đã trong team chưa
    const exists = await TeamMember.findOne({ where: { team_id, user_id } });
    if (exists) throw new Error("Người dùng đã là thành viên của nhóm");

    //Thêm vào team_members
    await TeamMember.create({
      team_id,
      user_id,
      role: "member",
    });

    // Tìm conversation của team
    const conversation = await Conversation.findOne({
      where: { team_id, type: "team" },
    });
    if (!conversation) throw new Error("Không tìm thấy phòng chat của nhóm");

    //  Thêm vào conversation_participants
    await ConversationParticipant.create({
      conve_id: conversation.conve_id,
      user_id,
      role: "member",
    });

    return { team_id, user_id };
  } catch (error) {
    console.error("Lỗi khi mời thành viên (Service):", error.message);
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
    if (team.owner_team_id !== owner_team_id) {
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

module.exports = {
  createTeam,
  updateTeam,
  deleteTeam,
  getAllTeamsByOwner,
  inviteMember,
  removeMember,
  getTeamMembers,
};
