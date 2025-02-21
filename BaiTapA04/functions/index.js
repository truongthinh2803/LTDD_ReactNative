const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

// Cấu hình cho dịch vụ gửi email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "khoapham1172003@gmail.com",
    pass: "dangkhoa117*",
  },
});

// Firebase Function để gửi OTP qua email
exports.sendOTP = functions.https.onCall(async (data, context) => {
  const email = data.email;
  const otp = data.otp; // Nhận mã OTP từ client-side

  const mailOptions = {
    from: "khoapham1172003@gmail.com",
    to: email,
    subject: "Mã OTP của bạn",
    text: `Mã OTP của bạn là ${otp}`,
  };

  try {
    // Gửi email
    await transporter.sendMail(mailOptions);
    return {success: true}; // Trả lại thành công khi gửi email
  } catch (error) {
    throw new functions.https.HttpsError("failed-precondition", error.message);
  }
});
