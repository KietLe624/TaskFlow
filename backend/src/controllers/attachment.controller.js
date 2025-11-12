const attachmentService = require("../services/attachment.service");

const uploadAttachment = async (req, res) => {
    // Lấy file, body (conve_id) và user_id (từ token)
    const { conve_id, task_id } = req.body;
    const user_id = req.user.user_id; // Từ middleware authenticateToken
    const file = req.file; // Từ middleware uploadToS3 (multer-s3)

    if (!file) {
        return res.status(400).send({ message: 'Không có file nào được tải lên.' });
    }

    try {
        let message_id = null;
        let finalAttachmentData = null;

        // 1. XỬ LÝ NẾU LÀ FILE CHAT (có conve_id)
        if (conve_id) {
            // 1a. Tạo tin nhắn trước (nội dung là tên file)
            const newMessage = await chatService.sendMessage({ 
                conve_id: conve_id, 
                sender_id: user_id, 
                content: file.originalname // Gửi tên file làm nội dung tin nhắn
            });
            message_id = newMessage.mess_id;

            // 1b. Tạo bản ghi attachment, liên kết với message_id vừa tạo
            const attachmentResult = await attachmentService.createAttachment(
                file, 
                { message_id: message_id, task_id: null }, // Body
                user_id,
                file.key, // s3Key (từ multer-s3)
                file.location // fileUrl (từ multer-s3)
            );
            
            finalAttachmentData = attachmentResult.attachment;

            // 1c. (QUAN TRỌNG) Lấy tin nhắn đầy đủ (kèm sender + attachment)
            const fullMessage = await db.Message.findByPk(message_id, {
                 include: [
                    { model: db.User, as: 'sender', attributes: ["user_id", "full_name", "avatar_url"] },
                    { model: db.Attachment, as: 'attachments' }
                ]
            });

            // 1d. Phát tin nhắn qua Socket.IO
            const io = req.app.get('socketio'); // (Cần gắn io vào app ở file server.js)
            io.to(conve_id).emit('receiveMessage', fullMessage);
        
        } 
        // 2. XỬ LÝ NẾU LÀ FILE TASK (có task_id)
        else if (task_id) {
            const attachmentResult = await attachmentService.createAttachment(
                file, 
                { message_id: null, task_id: task_id },
                user_id, file.key, file.location
            );
            finalAttachmentData = attachmentResult.attachment;
        } 
        // 3. Nếu không có context (chỉ upload)
        else {
             // Vẫn lưu nhưng không liên kết
             const attachmentResult = await attachmentService.createAttachment(
                file, { message_id: null, task_id: null },
                user_id, file.key, file.location
            );
             finalAttachmentData = attachmentResult.attachment;
        }
        return res.status(201).json({ 
            message: "Upload thành công", 
            attachment: finalAttachmentData 
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
