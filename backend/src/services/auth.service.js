const db = require("../models/index.model"); // Import file index trung tâm
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

// Func Login
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
    { user_id: user.user_id, email: user.email, roles: roles },
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

const forgotPassword = async (email) => {
  if (!email) {
    throw new Error("Thiếu thông tin email.");
  }

  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    console.warn(
      `[Forgot Password] Yêu cầu reset cho email không tồn tại: ${email}`
    );
    return null;
  }
  const resetToken = jwt.sign(
    { user_id: user.user_id, email: user.email },
    process.env.JWT_SECRET, // Sử dụng key riêng cho reset mật khẩu
    { expiresIn: "1h", algorithm: "HS256" } // Token chỉ nên sống 1 giờ
  );
  return resetToken;
};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
  forgotPassword,
};
