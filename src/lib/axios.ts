import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL_BACKEND,
  withCredentials: true, // Always include cookies (httpOnly cookies sẽ tự động gửi)
  headers: {
    "Content-Type": "application/json",
  },
  //  Token được gửi tự động qua httpOnly cookies
});

// Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response, // Success - do nothing
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is not 401 or no config, reject immediately
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Skip auto-refresh for auth endpoints (login, register, refresh)
    // These endpoints should show their own error messages
    const url = originalRequest.url || "";
    if (
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // If already retried, reject (prevent infinite loop)
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // If refreshing is in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call refresh endpoint
      await axios.post(
        `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/auth/refresh`,
        {},
        {
          withCredentials: true, // Send refreshToken cookie
        }
      );

      // Refresh successful - process queued requests
      processQueue();
      isRefreshing = false;

      // Retry original request
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed - clear queue
      processQueue(refreshError as Error);
      isRefreshing = false;

      //   KHÔNG tự động redirect về /login!
      // Lý do: Trang chủ và nhiều trang khác là PUBLIC, không cần đăng nhập
      // Chỉ return error, để component tự xử lý (hiện login button vs user menu)

      return Promise.reject(refreshError);
    }
  }
);

export default api;
