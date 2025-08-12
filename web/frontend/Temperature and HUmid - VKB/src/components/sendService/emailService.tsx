// Định nghĩa kiểu dữ liệu cho object được gửi đi
interface SendEmailPayload {
  recipient: string;
  subject: string;
  text: string;
}

// Định nghĩa kiểu dữ liệu cho kết quả trả về từ API
interface ApiResponse {
  message: string;
}

// Hàm này hoàn toàn độc lập và có thể tái sử dụng ở bất cứ đâu.
export const sendEmailAPI = async (payload: SendEmailPayload): Promise<ApiResponse> => {
  try {
    // URL này nên được lưu trong file .env để dễ thay đổi
    const API_URL = 'http://localhost:3001/send-email'; 

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result: ApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Lỗi không xác định từ server');
    }
    return result;
  } catch (error) {
    console.error('Lỗi trong hàm dịch vụ sendEmailAPI:', error);
    throw error;
  }
};