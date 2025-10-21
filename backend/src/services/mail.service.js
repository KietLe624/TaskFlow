const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Cấu hình transporter sử dụng Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Hàm gửi mail chung (tái sử dụng được)
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề
 * @param {string} html - Nội dung HTML
 */
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: '"TaskFlow" <no-reply@taskflow.com>',
      to: to,
      subject: subject,
      html: html,
    };

    // 2. Gửi mail
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `(Mailtrap) Đã "bắt" email gửi tới ${to}. Message ID: ${info.messageId}`
    );
    return info;
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
    throw new Error("Không thể gửi email.");
  }
};

/**
 * Hàm chuyên dụng để gửi mail reset mật khẩu.
 * Sẽ được gọi bởi auth.controller.js
 *
 * @param {string} userEmail - Email của người quên mật khẩu
 * @param {string} resetLink - Link reset (http://...token=...)
 */
const sendResetPasswordEmail = async (userEmail, resetLink) => {
  const subject = "[TaskFlow] Yêu cầu đặt lại mật khẩu của bạn";

  // 3. Tạo nội dung email (HTML)
  // (Dùng inline style vì email client không hỗ trợ CSS ngoài tốt)
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h2 style="color: #333;">Yêu cầu Đặt lại Mật khẩu</h2>
      <p>Xin chào,</p>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản TaskFlow của bạn.</p>
      <p>Vui lòng nhấp vào nút dưới đây để đặt lại mật khẩu. Liên kết này sẽ hết hạn sau 15 phút.</p>
      <a 
        href="${resetLink}" 
        target="_blank"
        style="background-color: #007ACC; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;"
      >
        Đặt lại mật khẩu
      </a>
      <p style="margin-top: 20px;">Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
      <p>Trân trọng,<br>Đội ngũ TaskFlow</p>
    </div>
  `;

  // 4. Gọi hàm gửi mail chung
  return sendEmail(userEmail, subject, html);
};

// 5. Xuất hàm để controller có thể dùng
module.exports = {
  sendEmail,
  sendResetPasswordEmail,
};
