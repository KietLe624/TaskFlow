const db = require("../models/index.model"); // Import file index trung tâm
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

// Func Register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Thiếu thông tin" });
    }

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // Kiểm tra xem username đã tồn tại chưa
    const existingUsername = await db.User.findOne({ where: { username } });
    if (existingUsername) {
      return res
        .status(400)
        .json({ message: "Tên người dùng đã được sử dụng" });
    }

    // Mã hoá mật khẩu bằng bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = await db.User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Đăng ký thành công", user: newUser });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
// Func Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Tìm người dùng theo email
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Tạo JWT
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h", algorithm: "HS256" }
    );

    res.status(200).json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Kiểm tra tham số đầu vào
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Thiếu thông tin cần thiết." });
    }

    // Tìm user theo email
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại." });
    }

    // So sánh mật khẩu cũ
    const isPasswordValid = await bcrypt.compare(
      String(oldPassword),
      String(user.password)
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng." });
    }

    // Kiểm tra mật khẩu mới hợp lệ
    if (String(newPassword).length < 6) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
    }

    // Mã hoá mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(String(newPassword), 10);

    // Cập nhật vào DB
    await db.User.update({ password: hashedNewPassword }, { where: { email } });

    console.log(`Mật khẩu người dùng ${email} đã được thay đổi.`); // debug log
    return res.status(200).json({ message: "Đổi mật khẩu thành công." });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error); // debug log
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

const forgotPassword = async (req, res) => {
  // Implementation for forgot password can be added here
  const { email } = req.body;
  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    }
    // Logic to send a password reset email or token can be implemented here
    res.status(200).json({ message: "Yêu cầu đặt lại mật khẩu đã được gửi" });
  } catch (error) {
    console.error("Lỗi yêu cầu đặt lại mật khẩu:", error); // debug log
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

module.exports = {
  register,
  login,
  changePassword,
  forgotPassword,
};
