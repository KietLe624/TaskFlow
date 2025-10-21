const authService = require("../services/auth.service");
const emailService = require("../services/mail.service");

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
  const { email } = req.body;
  try {
    const resetToken = await authService.forgotPassword(email);
    // kiểm tra nếu có token thì gửi email
    if (resetToken) {
      // 3. Tạo link và gửi mail (dùng Mailtrap/Nodemailer)
      const resetLink = `http://localhost:4200/reset-password?token=${resetToken}`;
      await emailService.sendResetPasswordEmail(email, resetLink);
    }

    return res.status(200).json({
      message:
        "Nếu email của bạn tồn tại, một liên kết đặt lại mật khẩu đã được gửi.",
    });
  } catch (error) {
    console.error("Lỗi yêu cầu đặt lại mật khẩu:", error);
    // Vẫn trả về 200 OK
    return res.status(200).json({
      message:
        "Nếu email của bạn tồn tại, một liên kết đặt lại mật khẩu đã được gửi.",
    });
  }
};

// Func Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Thiếu token hoặc mật khẩu mới." });
    }

    await authService.resetPassword(token, newPassword);

    return res
      .status(200)
      .json({ message: "Mật khẩu đã được đặt lại thành công." });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    return res.status(400).json({ message: error.message }); // Gửi lỗi (ví dụ: "Token hết hạn")
  }
};

module.exports = {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
};
