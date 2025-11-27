const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

// Load .env file
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

// Tạo kết nối MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Thực hiện kết nối
connection.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối database: " + err.stack);
    return;
  }
  console.log(
    "Kết nối database MySQL thành công với ID: " + connection.threadId
  );
});

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);
console.log("DB_NAME:", process.env.DB_NAME);

module.exports = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  dialect: process.env.DB_DIALECT,
};
