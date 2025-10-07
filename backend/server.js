// ===== Import dependencies =====
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

// ===== App setup =====
const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

// ===== MySQL connection pool =====
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "taskflow_db",
  waitForConnections: true,
  connectionLimit: 10,
});

const API_PREFIX = process.env.API_PREFIX || '/api';
app.get(`${API_PREFIX}/test`, (_req, res) => res.send('TaskFlow API is running'));


// ===== Server listen =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
