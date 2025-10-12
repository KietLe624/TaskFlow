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
const loginUser = async (email, password) => {
  // Kiểm tra đầu vào
  if (!email || !password) {
    throw new Error("Thiếu thông tin đăng nhập");
  }

  // Tìm người dùng
  const user = await db.User.findOne({
    where: { email },
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
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  // Kiểm tra mật khẩu
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }
  const roles = user.roles.map((r) => r.name);
  // Tạo JWT token
  const token = jwt.sign(
    { user_id: user.user_id, email: user.email, roles: roles },
    process.env.JWT_SECRET,
    { expiresIn: "1h", algorithm: "HS256" }
  );

  // Trả về token và thông tin user
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
  // Kiểm tra tham số đầu vào
  if (!email || !oldPassword || !newPassword) {
    throw new Error("Thiếu thông tin cần thiết.");
  }
  // Tìm user theo email
  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }
  // So sánh mật khẩu cũ
  const isPasswordValid = await bcrypt.compare(
    String(oldPassword),
    String(user.password)
  );

  if (!isPasswordValid) {
    throw new Error("Mật khẩu hiện tại không đúng.");
  }
  // Kiểm tra mật khẩu mới hợp lệ
  if (String(newPassword).length < 6) {
    throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
  }
  // Mã hoá mật khẩu mới
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  // Cập nhật mật khẩu mới
  user.password = hashedNewPassword;
  await user.save();
};

// Func Forgot Password

const forgotPassword = async (email) => {
  // Kiểm tra email
  if (!email) {
    throw new Error("Thiếu thông tin email.");
  }

  // Tìm user theo email
  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }

  // Tạo token đặt lại mật khẩu
  const resetToken = jwt.sign(
    { user_id: user.user_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h", algorithm: "HS256" }
  );
};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
  forgotPassword,
};
