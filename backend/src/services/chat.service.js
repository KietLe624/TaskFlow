const db = require("../models/index.model");
const { Conversation, Message, User, ConversationParticipant, Attachment } = db;

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

  async sendMessage({ conve_id, sender_id, content }) {
    const message = await Message.create({
      conve_id,
      sender_id,
      content,
    });
    return message;
  },

  async getMessages(conve_id) {
    return await Message.findAll({
      where: { conve_id },
      include: [{ model: User, attributes: ["full_name", "avatar_url"] }],
      order: [["created_at", "ASC"]],
    });
  },

};

module.exports = chatService;
