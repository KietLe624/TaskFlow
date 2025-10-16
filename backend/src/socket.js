import { Server } from "socket.io";
import { chatService } from "./services/chat.service.js";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    // Tham gia vào phòng theo team_id
    socket.on("joinRoom", (team_id) => {
      socket.join(`team_${team_id}`);
      console.log(`User joined room team_${team_id}`);
    });

    // Khi có tin nhắn mới
    socket.on("sendMessage", async (data) => {
      const message = await chatService.sendMessage(data);
      io.to(`team_${data.team_id}`).emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
};
