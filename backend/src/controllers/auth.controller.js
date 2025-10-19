const authService = require("../services/auth.service");

// Controller Register
const register = async (req, res) => {
  try {
    // Gọi service đăng ký
    const newUser = await authService.registerUser(req.body);
    res.status(201).json({
      message: "Đăng ký thành công",
      user: newUser,
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(400).json({ message: error.message || "Lỗi máy chủ" });
  }
};

// Controller Login
const login = async (req, res) => {
  try {
    const { loginInput, password } = req.body;

    const { token, user } = await authService.loginUser(loginInput, password);

    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user,
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(400).json({ message: error.message || "Lỗi máy chủ" });
  }
};

// Controller Change Password
const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    // Gọi service đổi mật khẩu
    await authService.changePassword(email, oldPassword, newPassword);
    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    res.status(400).json({ message: error.message || "Lỗi máy chủ" });
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
