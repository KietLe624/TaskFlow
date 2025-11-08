const express = require("express"); // Import express để tạo ứng dụng web
const app = express(); // Tạo ứng dụng express
const cors = require("cors"); // Import cors để xử lý CORS
const bodyParser = require("body-parser"); // Import body-parser để phân tích dữ liệu từ
const http = require("http"); // Import http để tạo server
const { Server } = require("socket.io"); // Import socket.io để xử lý WebSocket
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" })); // localhost:4200 --> Angular

const API_PREFIX = process.env.API_PREFIX || "/api";
const ADMIN_PREFIX = process.env.ADMIN_PREFIX || "/admin";

// const path = require("path");
// Load .env file
require("dotenv").config({ path: "../.env" });

// Tạo HTTP server từ Express
const server = http.createServer(app);

// Gắn Socket.io vào server đó
const io = new Server(server, {
  cors: {
    origin: "*", // cho phép mọi nguồn (Postman, frontend, v.v.)
    methods: ["GET", "POST"],
  },
});
// Xử lý sự kiện Socket.io
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  // Client join phòng
  socket.on("joinRoom", (team_id) => {
    socket.join(`team_${team_id}`);
    console.log(`👥 User joined room team_${team_id}`);
  });

  // Khi nhận tin nhắn
  socket.on("sendMessage", (data) => {
    console.log("📨 Tin nhắn mới:", data);
    io.to(`team_${data.team_id}`).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

// Import route user
const userApi = require("./src/routers/api-route/user.api");
const authApi = require("./src/routers/api-route/auth.api");
const dashboardApi = require("./src/routers/api-route/dashboard.api");
const taskApi = require("./src/routers/api-route/task.api");
const projectApi = require("./src/routers/api-route/project.api");
const teamApi = require("./src/routers/api-route/team.api");
const testApi = require("./src/routers/api-route/test.api");
const attachmentRoutes = require("./src/routers/api-route/attachment.api");

app.use(`${API_PREFIX}/auth`, authApi);
app.use(`${API_PREFIX}/dashboard`, dashboardApi);
app.use(`${API_PREFIX}/task`, taskApi);
app.use(`${API_PREFIX}/user`, userApi);
app.use(`${API_PREFIX}/project`, projectApi);
app.use(`${API_PREFIX}/team`, teamApi);
app.use(`${API_PREFIX}/test`, testApi);
app.use(`${API_PREFIX}/attachment`, attachmentRoutes);

// route admin
const roleApi = require("./src/routers/ad-route/role.api");

app.use(`${ADMIN_PREFIX}/role`, roleApi);

// Test route
app.get(`${API_PREFIX}/get`, (req, res) => {
  res.json({ message: "Hello from server!" });
});

// app.listen(PORT, () =>
//   console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`)
// );
server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
