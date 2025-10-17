const express = require("express");
const router = express.Router();
const { upload, uploadToS3 } = require("../../middleware/upload.middleware");
const { uploadFile } = require("../../controllers/upload.controller");

// POST /api/test/upload
router.post("/test/upload", upload.single("file"), uploadToS3, uploadFile);

module.exports = router;
