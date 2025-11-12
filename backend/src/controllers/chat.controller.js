const chatService = require("../services/chat.service");

const getMessagesByConversation = async (req, res) => {
  try {
    const { conve_id } = req.params;

    if (!conve_id) {
      return res.status(400).json({ message: "Thiếu ID của cuộc trò chuyện" });
    }

    // Gọi service bạn đã viết (lưu ý: file service của bạn tên là Message)
    const messages = await chatService.getMessages(conve_id);

    return res.status(200).json(messages);
  } catch (error) {
    console.error(
      "Lỗi tại getMessagesByConversation Controller:",
      error.message
    );
    return res.status(500).json({ message: "Lỗi server khi lấy tin nhắn" });
  }
};

module.exports = {
  getMessagesByConversation,
};
