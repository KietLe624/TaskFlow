const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../middleware/auth.middleware");
const {
  getMessagesByConversation,
} = require("../../controllers/chat.controller");

router.get("/messages/:conve_id", authenticateToken, getMessagesByConversation);

module.exports = router;
