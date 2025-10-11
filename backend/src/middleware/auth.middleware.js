const jwt = require("jsonwebtoken");
const db = require("../models/index.model");
const User = db.User;

// Thay 'YOUR_SECRET_KEY' bằng một chuỗi bí mật của riêng bạn
const SECRET_KEY = process.env.JWT_SECRET;  

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ message: "Token không được cung cấp." });
  }

  try {
    const userPayload = await new Promise((resolve, reject) => {
      jwt.verify(token, SECRET_KEY, (err, payload) => {
        if (err) reject(err);
        else resolve(payload);
      });
    });

    console.log("User payload:", userPayload); // Debug payload

    if (!userPayload || !userPayload.user_id) {
      return res
        .status(403)
        .json({ message: "Token không chứa thông tin user_id hợp lệ." });
    }

    const user = await User.findByPk(userPayload.user_id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    req.user = user; // Gán instance User
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Token không hợp lệ.", error: error.message });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    console.log("req.user_id:", req.user_id); // Debug req.user
    console.log("req.user:", req.user); // Debug req.user
    if (!req.user || !req.user.user_id) {
      return res
        .status(400)
        .send({ message: "Thông tin người dùng không hợp lệ." });
    }

    const roles = await req.user.getRoles();
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        next();
        return;
      }
    }
    console.log(
      "User roles:",
      roles.map((role) => role.name)
    );
    return res.status(403).send({ message: "Yêu cầu quyền Admin!" });
  } catch (error) {
    console.error("Lỗi xác thực quyền Admin:", error);
    return res.status(500).send({
      message: "Không thể xác thực quyền Admin.",
      error: error.message,
    });
  }
};

module.exports = { authenticateToken, isAdmin };
