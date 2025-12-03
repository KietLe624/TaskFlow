const db = require("../models/index.model"); // Import file index trung tâm
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Func Register
const registerUser = async ({ username, email, password }) => {
  if (!username || !email || !password) {
    throw new Error("Thiếu thông tin");
  }

  // Kiểm tra email tồn tại
  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("Email đã được sử dụng");
  }

  // Kiểm tra username tồn tại
  const existingUsername = await db.User.findOne({ where: { username } });
  if (existingUsername) {
    throw new Error("Tên người dùng đã được sử dụng");
  }

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);

  // Tạo user mới
  const newUser = await db.User.create({
    username,
    email,
    password: hashedPassword,
  });

  // Gán role mặc định = 'member'
  const memberRole = await db.Role.findOne({ where: { name: "member" } });

  if (memberRole) {
    await db.UserRole.create({
      user_id: newUser.user_id,
      role_id: memberRole.role_id,
    });
  }

  return newUser;
};

// Func Login (Email hoặc Username)
const loginUser = async (loginInput, password) => {
  if (!loginInput || !password) {
    throw new Error("Thiếu thông tin đăng nhập");
  }

  // Tìm người dùng theo email hoặc username
  const user = await db.User.findOne({
    where: {
      [db.Sequelize.Op.or]: [{ email: loginInput }, { username: loginInput }],
    },
    include: [
      {
        model: db.Role,
        as: "roles",
        attributes: ["name"],
        through: { attributes: [] },
      },
    ],
  });

  if (!user) {
    throw new Error("Email hoặc tên đăng nhập không đúng");
  }

  // Kiểm tra mật khẩu
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Mật khẩu không đúng");
  }

  // Lấy roles
  const roles = user.roles.map((r) => r.name);

  // Tạo JWT token
  const token = jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      roles: roles,
      username: user.username,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h", algorithm: "HS256" }
  );

  return {
    token,
    user: {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      roles: roles,
    },
  };
};

// Func Change Password
const changePassword = async (email, oldPassword, newPassword) => {
  if (!email || !oldPassword || !newPassword) {
    throw new Error("Thiếu thông tin cần thiết.");
  }
  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }
  const isPasswordValid = await bcrypt.compare(
    String(oldPassword),
    String(user.password)
  );

  if (!isPasswordValid) {
    throw new Error("Mật khẩu hiện tại không đúng.");
  }
  if (String(newPassword).length < 6) {
    throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
  }
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword;
  await user.save();
};

const RESET_SECRET = process.env.JWT_RESET_SECRET; // sử dụng key riêng cho reset password

// Func Forgot Password
const forgotPassword = async (email) => {
  if (!email) {
    throw new Error("Thiếu thông tin email.");
  }

  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    console.warn(`Không tìm thấy người dùng với email`);
    return null;
  }
  // Tạo token reset với thời hạn ngắn hơn so với key chính
  const resetToken = jwt.sign(
    { user_id: user.user_id, email: user.email },
    RESET_SECRET,
    { expiresIn: "15m" } // time 15p
  );
  return resetToken;
};

const resetPassword = async (token, newPassword) => {
  let userPayload;

  try {
    userPayload = jwt.verify(token, RESET_SECRET);
  } catch (error) {
    throw new Error("Token không hợp lệ hoặc đã hết hạn.");
  }

  const { user_id } = userPayload;
  const user = await db.User.findByPk(user_id);
  if (!user) {
    throw new Error("Người dùng không còn tồn tại.");
  }
  if (newPassword.length < 6) {
    throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();
};

const resetPasswordForAdmin = async (userId, newPassword) => {
  const user = await db.User.findByPk(userId);
  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }
  const defaultPassword = "123456";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  await user.update({ password: hashedPassword });

  return {
    message: "Reset mật khẩu thành công",
    newPassword:
      process.env.NODE_ENV === "development" ? defaultPassword : undefined,
  };
};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
  resetPasswordForAdmin,
};
