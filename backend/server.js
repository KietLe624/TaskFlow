const express = require("express"); // Import express để tạo ứng dụng web
const app = express(); // Tạo ứng dụng express
const cors = require("cors"); // Import cors để xử lý CORS
const bodyParser = require("body-parser"); // Import body-parser để phân tích dữ liệu từ
const http = require("http"); // Import http để tạo server
const { Server } = require("socket.io"); // Import socket.io để xử lý WebSocket
const { setupSocket } = require("./src/socket");

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" })); // localhost:4200 --> Angular

const API_PREFIX = process.env.API_PREFIX || "/api";
const ADMIN_PREFIX = process.env.ADMIN_PREFIX || "/admin";

// const path = require("path");
// Load .env file
require("dotenv").config({ path: "../.env" });

// Tạo HTTP server từ Express
const server = http.createServer(app);

setupSocket(server, app);

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
const chat = require("./src/routers/api-route/chat.api");
const notificationApi = require("./src/routers/api-route/notification.api");
const calendarApi = require("./src/routers/api-route/calendar.api");

app.use(`${API_PREFIX}/auth`, authApi);
app.use(`${API_PREFIX}/dashboard`, dashboardApi);
app.use(`${API_PREFIX}/task`, taskApi);
app.use(`${API_PREFIX}/user`, userApi);
app.use(`${API_PREFIX}/project`, projectApi);
app.use(`${API_PREFIX}/team`, teamApi);
app.use(`${API_PREFIX}/test`, testApi);
app.use(`${API_PREFIX}/attachment`, attachmentRoutes);
app.use(`${API_PREFIX}/chat`, chat);
app.use(`${API_PREFIX}/notifications`, notificationApi);
app.use(`${API_PREFIX}/calendar`, calendarApi);

// route admin
const adminApi = require("./src/routers/ad-route/admin.api");

app.use(`${ADMIN_PREFIX}`, adminApi);

server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
