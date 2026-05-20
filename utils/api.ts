import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "/api/backend",
});

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error.response?.status === 401) {

      localStorage.clear();

      toast.error("Session expired. Please login again.", { toastId: 'session_expired' });

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;