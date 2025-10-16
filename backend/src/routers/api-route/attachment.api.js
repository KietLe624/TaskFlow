const express = require("express");
const router = express.Router();
const uploadS3 = require("../../middleware/upload.middleware");
const { uploadAttachment } = require("../../controllers/attachment.controller");

// POST /api/attachments/upload
router.post("/attachments/upload", uploadS3.single("file"), uploadAttachment);

module.exports = router;
