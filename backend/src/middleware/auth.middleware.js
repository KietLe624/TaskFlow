const jwt = require("jsonwebtoken");
const db = require("../models/index.model");
const User = db.User;
const Role = db.Role;
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

    if (!userPayload || !userPayload.user_id) {
      return res
        .status(403)
        .json({ message: "Token không chứa thông tin user_id hợp lệ." });
    }

    const user = await User.findByPk(userPayload.user_id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    req.user = user;

    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Token không hợp lệ.", error: error.message });
  }
};

// middleware phân quyền
const loadUserWithRoles = async (req, res, next) => {
  if (!req.user || !req.user.user_id) {
    return res.status(401).json({ message: "Chưa xác thực" });
  }

  try {
    const user = await User.findByPk(req.user.user_id, {
      include: [
        {
          model: Role,
          as: "roles",
          through: { attributes: [] },
          attributes: ["name"],
        },
      ],
    });

    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    req.user = user; // GIỮ LẠI SEQUELIZE INSTANCE để req.user.roles khả dụng
    next();
  } catch (error) {
    console.error("Lỗi loadUserWithRoles:", error);
    res.status(500).json({ message: "Lỗi load user roles" });
  }
};

const authorize = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).send({ message: "Chưa xác thực." });
      }

      // nếu req.user là Sequelize instance và chưa include roles, bạn có thể await req.user.getRoles()
      const userRoles = req.user.roles ? req.user.roles.map((r) => r.name) : [];

      const hasPermission = userRoles.some((name) => roles.includes(name));

      if (!hasPermission) {
        return res.status(403).send({
          message: `Yêu cầu quyền: ${roles.join(" hoặc ")}!`,
        });
      }
      next();
    } catch (error) {
      console.error("Lỗi xác thực quyền:", error);
      return res
        .status(500)
        .send({ message: "Không thể xác thực quyền.", error: error.message });
    }
  };
};

const isAdmin = authorize("admin");

module.exports = {
  authenticateToken,
  authorize,
  isAdmin,
  loadUserWithRoles,
};
