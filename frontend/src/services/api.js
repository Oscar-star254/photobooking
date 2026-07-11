import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === "development" ? "/api" : "https://photobooking-2-d4nb.onrender.com/api");

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    if (!error.response) {
      console.error("Network error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;