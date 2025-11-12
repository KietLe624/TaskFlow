const express = require("express");
const router = express.Router();
const { upload, uploadToS3 } = require("../../middleware/upload.middleware");
const { authenticateToken } = require("../../middleware/auth.middleware");

// controllers
const {
  uploadAttachment,
  getAttachmentsByTask,
  getAttachmentsByMessage,
  deleteAttachment,
  deleteAttachmentS3,
} = require("../../controllers/attachment.controller");

// routes
router.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  uploadToS3,
  uploadAttachment
);
router.get("/task/:task_id", authenticateToken, getAttachmentsByTask);
router.get("/message/:message_id", authenticateToken, getAttachmentsByMessage);
router.delete("/delete/:attach_id", authenticateToken, deleteAttachment);
router.delete("/deleteS3/:attach_id/force", authenticateToken, deleteAttachmentS3);

module.exports = router;
