// socket.js (Backend - Sửa thành CommonJS)

const { Server } = require("socket.io"); // Dùng require
const chatService = require("./services/chat.service.js"); // Dùng require

const setupSocket = (server, app) => {
  // Thêm 'app' để gắn io vào
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    // Logic join phòng (dùng conve_id)
    socket.on("joinRoom", (conve_id) => {
      if (!conve_id) return;
      const roomName = `conversation_${conve_id}`;
      socket.join(roomName);
      console.log(`User ${socket.id} joined room ${roomName}`);
    });

    // Khi có tin nhắn mới (với try/catch)
    socket.on("sendMessage", async (data) => {
      console.log("Tin nhắn mới (Log 1):", data);
      const { conve_id, sender_id, content } = data;
      try {
        if (!chatService || typeof chatService.sendMessage !== "function") {
          throw new Error(
            "Lỗi: chatService.sendMessage không phải là một hàm."
          );
        }
        console.log("Đang gọi chatService.sendMessage... (Log 2)");
        const message = await chatService.sendMessage({
          conve_id,
          sender_id,
          content,
        });
        console.log("Đã lưu DB, message ID: (Log 3)", message.mess_id);
        const roomName = `conversation_${conve_id}`;
        io.to(roomName).emit("receiveMessage", message);
      } catch (error) {
        console.error("Socket: LỖI KHI LƯU DB:", error.message, error.stack);
        socket.emit("sendMessageError", { error: "Không thể gửi tin nhắn" });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  // Gắn io vào app để controller (vd: upload file) có thể dùng
  app.set("socketio", io);
};

module.exports = { setupSocket }; // Export CJS
