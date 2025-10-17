const uploadFile = async (req, res) => {
  try {
    res.status(200).json({
      message: "Upload thành công (AWS SDK v3)",
      file_key: req.s3Key,
      file_url: req.fileUrl,
    });
  } catch (error) {
    console.error("❌ Lỗi controller:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadFile };
