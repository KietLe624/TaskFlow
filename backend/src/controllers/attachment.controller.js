const { Attachment } = require("../models");

const uploadAttachment = async (req, res) => {
  try {
    const { task_id, message_id } = req.body;
    const user_id = req.user?.user_id || 1; // tạm hardcode user_id = 1 nếu chưa có auth

    if (!req.file) {
      return res.status(400).json({ message: "Chưa chọn file!" });
    }

    // Lưu metadata vào DB
    const attachment = await Attachment.create({
      task_id: task_id || null,
      message_id: message_id || null,
      file_name: req.file.originalname,
      file_url: req.file.key, // ✅ lưu key S3, không lưu URL
      file_size: req.file.size,
      created_by: user_id,
      created_at: new Date(),
    });

    res.status(200).json({
      message: "Upload thành công!",
      data: attachment,
    });
  } catch (error) {
    console.error("❌ Lỗi upload attachment:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadAttachment };
