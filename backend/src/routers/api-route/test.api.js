const express = require("express");
const router = express.Router();
const uploadS3 = require("../../middleware/upload.middleware");
const { uploadToS3 } = require("../../controllers/upload.controller");

// POST /api/test/upload
router.post("/test/upload", uploadS3.single("file"), uploadToS3);

module.exports = router;
