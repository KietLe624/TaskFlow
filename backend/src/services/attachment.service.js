const db = require("../models/index.model"); // Import file index trung tâm
const { Attachment } = db;
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const createAttachment = async (file, body, user_id, s3Key, fileUrl) => {
  try {
    if (!file) throw new Error("Không có file để lưu vào DB");

    const attachment = await Attachment.create({
      task_id: body.task_id || null,
      message_id: body.message_id || null,
      file_name: file.originalname,
      file_url: s3Key, // lưu key file trên S3
      file_size: file.size,
      created_by: user_id,
      created_at: new Date(),
    });

    return {
      message: "Upload + lưu DB thành công ",
      file_key: s3Key,
      file_url: fileUrl,
      attachment,
    };
  } catch (error) {
    console.error("Lỗi tại AttachmentService ", error.message);
    throw error;
  }
};

// get attachments by task id
const getAttachmentsByTask = async (task_id) => {
  try {
    const attachments = await Attachment.findAll({
      where: { task_id },
      order: [["created_at", "DESC"]],
    });
    return attachments;
  } catch (error) {
    console.error(" Lỗi tại getAttachmentsByTask:", error.message);
    throw error;
  }
};

// get attachments by message id
const getAttachmentsByMessage = async (message_id) => {
  try {
    const attachments = await Attachment.findAll({
      where: { message_id },
      order: [["created_at", "DESC"]],
    });
    return attachments;
  } catch (error) {
    console.error(" Lỗi tại getAttachmentsByMessage:", error.message);
    throw error;
  }
};

// delete attachment
const deleteAttachment = async (attach_id, user_id) => {
  try {
    const attachment = await Attachment.findByPk(attach_id);
    if (!attachment) throw new Error("File không tồn tại");
    console.log("🧩 Debug quyền xoá:");
    console.log(
      "attachment.created_by:",
      attachment.created_by,
      typeof attachment.created_by
    );
    console.log("user_id:", user_id, typeof user_id);

    if (attachment.created_by !== user_id) {
      throw new Error("Bạn không có quyền xóa file này");
    }
    if (attachment.deleted_at !== undefined) {
      attachment.deleted_at = new Date();
      await attachment.save();
      return { message: "Đã đánh dấu xóa file (logic)" };
    }
    await attachment.destroy();
    return { message: "Đã xóa file khỏi database" };
  } catch (error) {
    console.error(" Lỗi tại deleteAttachment:", error.message);
    throw error;
  }
};

// ⚙️ Tạo S3 client dùng SDK v3 — phải ở PHẠM VI TOÀN CỤC
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// =======================
// 💣 DELETE FILE FROM S3 + DB
// =======================
const deleteAttachmentS3 = async (attach_id, user_id) => {
  try {
    const attachment = await Attachment.findByPk(attach_id);
    if (!attachment) throw new Error("File không tồn tại");

    console.log("🧩 Debug xoá file:", {
      created_by: attachment.created_by,
      user_id,
      key: attachment.file_url,
    });

    // ✅ Kiểm tra quyền
    if (Number(attachment.created_by) !== Number(user_id)) {
      throw new Error("Bạn không có quyền xóa file này");
    }

    // ✅ Xóa vật lý trên S3
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: attachment.file_url, // VD: "chat/1760720845005_950347979.jpg"
      })
    );

    // ✅ Xóa bản ghi DB
    await attachment.destroy();

    return { message: "Đã xóa file khỏi S3 và database", attachment };
  } catch (error) {
    console.error("Lỗi tại deleteAttachmentS3(Service):", error.message);
    throw error;
  }
};

module.exports = {
  createAttachment,
  getAttachmentsByTask,
  getAttachmentsByMessage,
  deleteAttachment,
  deleteAttachmentS3,
};
