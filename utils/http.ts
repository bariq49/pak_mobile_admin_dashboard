import axios from "axios";
import { getToken, removeToken } from "./get-token";

// Get base URL consistently with api-endpoints.ts
const getBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiUrl) {
    return "https://pak-mobile-store-backend.vercel.app";
  }
  // Remove trailing /api/v1 if present
  return apiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
};

const BASE_URL = getBaseUrl();

const http = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 30000,
});

http.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🚀 Detect FormData and remove default JSON header
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"]; // Let Axios set it automatically
    } else {
      config.headers["Content-Type"] = "application/json";
      config.headers.Accept = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - redirecting to login");
      removeToken();
    }
    return Promise.reject(error);
  }
);

export default http;
