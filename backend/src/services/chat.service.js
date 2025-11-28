const db = require("../models/index.model");
const { Conversation, Messages, User, ConversationParticipant, Attachment } =
  db;

const chatService = {
  async createConversation(team_id, team_name, owner_team_id) {
    const conversation = await Conversation.create({
      type: "team",
      title: `${team_name} - Chat`,
      team_id,
      created_by: owner_team_id,
    });
    console.log("DEBUG Conversation:", conversation.dataValues);

    // Thêm owner vào phòng chat
    await ConversationParticipant.create({
      conve_id: conversation.conve_id,
      user_id: owner_team_id,
    });
    return conversation;
  },

  async createProjectChat(project_id, project_name, owner_id, tx = null) {
    const opts = tx ? { transaction: tx } : {};
    const conversation = await Conversation.create(
      {
        type: "project",
        title: `Project ${project_name} - Chat`,
        project_id,
        created_by: owner_id,
      },
      opts
    );

    console.log("DEBUG Project Conversation:", conversation.dataValues);

    // tạo participant cho owner (trong cùng transaction nếu có)
    await ConversationParticipant.create(
      {
        conve_id: conversation.conve_id,
        user_id: owner_id,
        role: "owner",
      },
      opts
    );

    return conversation;
  },

  async sendMessage({ conve_id, sender_id, content }) {
    // 1. Tạo tin nhắn (Giả sử model Message đã sửa lỗi typo sned_id -> sender_id)
    const newMessage = await Messages.create({
      conve_id,
      sender_id,
      content,
    });

    // 2. Lấy lại tin nhắn đó NGAY LẬP TỨC kèm thông tin người gửi
    // (Đây là bước "enrichment" cực kỳ quan trọng)
    const fullMessages = await Messages.findByPk(newMessage.mess_id, {
      include: [
        {
          model: User,
          as: "sender", // Phải khớp với alias trong model Message
          attributes: ["user_id", "full_name", "username", "avatar_url"],
        },
      ],
    });

    if (!fullMessages) {
      throw new Error("Không thể tìm thấy tin nhắn vừa tạo.");
    }

    return fullMessages; // Trả về object đầy đủ cho socket
  },

  async getMessages(conve_id) {
    return await Messages.findAll({
      where: { conve_id },
      include: [
        {
          model: User,
          as: "sender", // Khớp với model Message
          attributes: ["user_id", "full_name", "username", "avatar_url"],
        },
        { model: Attachment, as: "attachments" },
      ],
      order: [["created_at", "ASC"]],
    });
  },
};

module.exports = chatService;
