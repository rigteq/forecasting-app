import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message;

    if (message === "ACCESS_EXPIRED") {
      localStorage.removeItem("accessToken");
      toast.error("Your session has expired. Please login again.");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;