const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

// Khởi tạo app Express
const app = express();
const port = 3001; // Chọn một cổng để server chạy, ví dụ 3001

// --- THÔNG TIN CẤU HÌNH NODEMAILER (Giữ nguyên như cũ) ---
const yourEmail = "bimat8781@gmail.com";
const yourAppPassword = "axmr lukx gzsx xqxe";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: yourEmail,
    pass: yourAppPassword,
  },
});

// --- CẤU HÌNH SERVER ---
app.use(cors()); // Cho phép Cross-Origin Resource Sharing
app.use(express.json()); // Cho phép server đọc dữ liệu JSON từ request body

// --- TẠO API ENDPOINT ĐỂ GỬI EMAIL ---
// Server sẽ lắng nghe các yêu cầu POST tại địa chỉ '/send-email'
app.post('/send-email', (req, res) => {
  console.log("Đã nhận được yêu cầu gửi email...");

  // Lấy dữ liệu được gửi từ frontend
  const { recipient, subject, text } = req.body;

  // Kiểm tra xem dữ liệu có đủ không
  if (!recipient || !subject || !text) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin: recipient, subject, text' });
  }

  // Cấu hình nội dung email với dữ liệu nhận được
  const mailOptions = {
    from: `"BTM IOT Team" <${yourEmail}>`,
    to: recipient,
    subject: subject,
    text: text,
  };

  // Gửi email
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.error("Lỗi khi gửi email:", error);
      // Trả về lỗi cho frontend
      return res.status(500).json({ message: 'Gửi email thất bại', error: error.message });
    } else {
      console.log("Email đã được gửi thành công! ID:", info.messageId);
      // Trả về thành công cho frontend
      return res.status(200).json({ message: 'Email đã được gửi thành công!' });
    }
  });
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server gửi email đang chạy tại http://localhost:${port}`);
});