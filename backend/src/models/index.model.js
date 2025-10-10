"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);

const dbConfig = require("../config/db.config.js");
const db = {};

if (!dbConfig || !dbConfig.dialect) {
  throw new Error(
    "Lỗi cấu hình: db.config.js không hợp lệ hoặc thiếu dialect."
  );
}

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    // Thêm cấu hình pool để quản lý kết nối tốt hơn
    max: dbConfig.pool ? dbConfig.pool.max : 5,
    min: dbConfig.pool ? dbConfig.pool.min : 0,
    acquire: dbConfig.pool ? dbConfig.pool.acquire : 30000,
    idle: dbConfig.pool ? dbConfig.pool.idle : 10000,
  },
  timezone: "+07:00",
});

// Đọc tất cả các file model trong thư mục hiện tại
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
