const attachmentService = require("../services/attachment.service");

const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Chưa có file!" });

    const created_by = req.user?.user_id;
    const result = await attachmentService.createAttachment(
      req.file,
      req.body,
      created_by,
      req.s3Key,
      req.fileUrl
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi uploadAttachment (Controller):", error.message);
    res.status(500).json({ message: error.message });
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
