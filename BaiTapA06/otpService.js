import axios from 'axios';

const mailjetApiKey = '90c2821e6ca4419868ca0a9251e1f14c'; // Thay bằng API Key của bạn
const mailjetSecretKey = 'c37ee0cc18a52da29b3a750350a23394'; // Thay bằng Secret Key của bạn

// Hàm sinh mã OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Mã OTP 6 số
};

// Hàm gửi OTP qua email sử dụng Mailjet
export const sendOTPEmail = async (email, otp) => {
  const data = {
    Messages: [
      {
        From: {
          Email: "khoapham1172003@gmail.com", // Email người gửi
          Name: "Mobile Shop", // Tên người gửi
        },
        To: [
          {
            Email: email, // Email người nhận
          },
        ],
        Subject: "Xác nhận mã OTP - Mobile Shop",
        TextPart: `Xin chào,

Mã OTP của bạn là: ${otp}. 

Mã này sẽ hết hạn sau 10 phút. Vui lòng không chia sẻ mã này với người khác.

Trân trọng,
Đội ngũ Mobile Shop`,
      },
    ],
  };
  const authHeader = 'Basic ' + btoa(`${mailjetApiKey}:${mailjetSecretKey}`);

  try {
    const response = await axios.post('https://api.mailjet.com/v3.1/send', data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    });
    console.log('Email sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending OTP via Mailjet:', error.response.data);
    throw new Error('Failed to send OTP. Please try again.');
  }
};
