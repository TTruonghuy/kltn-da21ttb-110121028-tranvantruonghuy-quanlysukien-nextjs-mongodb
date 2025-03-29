import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // Thay đổi thành URL của backend nếu khác
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
