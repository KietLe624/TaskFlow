const uploadToS3 = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Chưa chọn file!" });

    return res.status(200).json({
      message: "Upload thành công",
      file_key: req.file.key,      // ✅ key trong bucket
      file_url: req.file.location, // URL public (nếu bucket cho phép)
      bucket: req.file.bucket,
    });
  } catch (error) {
    console.error("❌ Lỗi:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadToS3 };
