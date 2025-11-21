const attachmentService = require("../services/attachment.service");
const chatService = require("../services/chat.service");
const db = require("../models/index.model");

const uploadAttachment = async (req, res) => {
  const { conve_id, task_id } = req.body;
  const user_id = req.user.user_id;
  const file = req.file;

  if (!file) {
    return res.status(400).send({ message: "Không có file nào được tải lên." });
  }

  try {
    let message_id = null;
    let finalAttachmentData = null;

    if (conve_id) {
      const newMessage = await chatService.sendMessage({
        conve_id: conve_id,
        sender_id: user_id,
        content: file.originalname,
      });
      message_id = newMessage.mess_id;

      const attachmentResult = await attachmentService.createAttachment(
        file,
        { message_id: message_id, task_id: null },
        user_id,
        file.key,
        file.location
      );
      finalAttachmentData = attachmentResult.attachment;

      // ← BÂY GIỜ db ĐÃ CÓ, KHÔNG CÒN LỖI UNDEFINED
      const fullMessage = await db.Messages.findByPk(message_id, {
        include: [
          {
            model: db.User,
            as: "sender",
            attributes: ["user_id", "full_name", "avatar_url"],
          },
          { model: db.Attachment, as: "attachments" },
        ],
      });

      const io = req.app.get("socketio");
      io.to(conve_id).emit("receiveMessage", fullMessage);
    } else if (task_id) {
      // task attachment...
    }

    return res.status(201).json({
      message: "Upload thành công",
      attachment: finalAttachmentData,
    });
  } catch (error) {
    console.error("Lỗi tại uploadAttachment Controller:", error.message);
    return res.status(500).json({ message: "Lỗi server khi upload file." });
  }
};

const getAttachmentsByTask = async (req, res) => {
  try {
    const { task_id } = req.params;
    const attachments = await attachmentService.getAttachmentsByTask(task_id);
    res.status(200).json({
      message: "Lấy danh sách file đính kèm thành công!",
      data: attachments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttachmentsByMessage = async (req, res) => {
  try {
    const { message_id } = req.params;
    const attachments = await attachmentService.getAttachmentsByMessage(
      message_id
    );
    res.status(200).json({
      message: "Lấy danh sách file đính kèm thành công!",
      data: attachments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* 
xử lý chức năng xoá file đính kèm
1. Xoá tạm thời
2. Xoá vĩnh viễn trong bucket 
*/

// chức năng xoá file ở database
const deleteAttachment = async (req, res) => {
  try {
    const { attach_id } = req.params;
    const user_id = req.user?.user_id;
    const result = await attachmentService.deleteAttachment(attach_id, user_id);
    res.status(200).json({
      message: "Xoá file đính kèm thành công!",
      data: result,
    });
  } catch (error) {
    console.error("Lỗi khi xoá file (Controller):", error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteAttachmentS3 = async (req, res) => {
  try {
    const { attach_id } = req.params;
    const user_id = req.user?.user_id;
    const result = await attachmentService.deleteAttachmentS3(
      attach_id,
      user_id
    );
    res
      .status(200)
      .json({ message: "Xoá file đính kèm khỏi S3 thành công!", data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadAttachment,
  getAttachmentsByTask,
  getAttachmentsByMessage,
  deleteAttachment,
  deleteAttachmentS3,
};
