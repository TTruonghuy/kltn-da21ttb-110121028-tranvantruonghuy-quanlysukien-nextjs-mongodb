import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // Đảm bảo URL này đúng
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Gửi cookie kèm theo request
});

// Thêm interceptor để tự động thêm JWT token vào header Authorization
api.interceptors.request.use((config) => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("jwt="))
    ?.split("=")[1]; // Lấy JWT token từ cookie
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Thêm token vào header Authorization
  }
  console.log("Request Config:", config);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("Response Data:", response.data);
    return response;
  },
  (error) => {
    console.error("Error Response:", error.response?.data || error.message); // Log chi tiết lỗi
    return Promise.reject(error);
  }
);

export default api;
