require("dotenv").config();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

//  Cấu hình multer để lưu tạm file local trước khi đẩy lên S3
const upload = multer({
  dest: path.join(__dirname, "../../uploads/temp"),
  limits: { fileSize: 20 * 1024 * 1024 }, // giới hạn 20MB
});

//  Khởi tạo S3Client (SDK v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Middleware upload file từ local lên S3
const uploadToS3 = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Chưa chọn file!" });
    }

    const filePath = req.file.path;
    const fileStream = fs.createReadStream(filePath);
    const ext = path.extname(req.file.originalname);
    const key = `chat/${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;

    //  Upload file lên S3
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: fileStream,
        ContentType: req.file.mimetype,
      })
    );

    // Xóa file local sau khi upload xong
    fs.unlinkSync(filePath);

    // Gắn thông tin để controller xử lý DB
    req.s3Key = key;
    req.fileUrl = `s3://${process.env.AWS_BUCKET_NAME}/${key}`;
    next();
  } catch (error) {
    console.error(" Lỗi upload lên S3:", error.message);
    res
      .status(500)
      .json({ message: "Lỗi upload lên S3", error: error.message });
  }
};

module.exports = { upload, uploadToS3 };
