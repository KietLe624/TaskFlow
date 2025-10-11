const express = require("express"); // Import express để tạo ứng dụng web
const app = express(); // Tạo ứng dụng express
const cors = require("cors"); // Import cors để xử lý CORS
const bodyParser = require("body-parser"); // Import body-parser để phân tích dữ liệu từ

// ===== App setup =====
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" })); // localhost:4200 --> Angular

const API_PREFIX = process.env.API_PREFIX || "/api";
const path = require("path");
// Load .env file
require("dotenv").config({ path: "../.env" });

// cấu hình db
const connection = require("./src/config/db.config"); // Import cấu hình database

// ===== Server listen =====
const PORT = process.env.PORT || 3000;

// Import route user
const userApi = require("./src/routers/api-route/user.api");
const authApi = require("./src/routers/api-route/auth.api");
const dashboardApi = require("./src/routers/api-route/dashboard.api");
const taskApi = require("./src/routers/api-route/task.api");

app.use(API_PREFIX, authApi); // Import route auth
app.use(API_PREFIX, dashboardApi); // Import route dashboard
app.use(API_PREFIX, taskApi); // Import route task
app.use(API_PREFIX, userApi); // Import route user


// Test route
app.get(`${API_PREFIX}/get`, (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(PORT, () =>
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`)
);
