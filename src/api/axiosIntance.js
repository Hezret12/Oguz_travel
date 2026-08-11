import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL =
  import.meta.env.VITE_API_MODE === 'development'
    ? import.meta.env.VITE_API_LOCAL_BACKEND_URL
    : import.meta.env.VITE_API_PROD_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// ── 401 Auto-Refresh Interceptor ──────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401 errors, skip for auth endpoints themselves
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/signin') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = Cookies.get('refreshToken');

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axiosInstance.post('/auth/refresh', {
        refreshToken: refreshToken,
        refresh_token: refreshToken,
      });

      const newAccessToken =
        response?.data?.data?.accessToken ||
        response?.data?.data?.access_token ||
        response?.data?.accessToken ||
        response?.data?.access_token;

      const newRefreshToken =
        response?.data?.data?.refreshToken ||
        response?.data?.data?.refresh_token ||
        response?.data?.refreshToken ||
        response?.data?.refresh_token;

      if (!newAccessToken) {
        throw new Error('No access token in refresh response');
      }

      // Persist new tokens matching Travel_server (7d / 30d)
      Cookies.set('accessToken', newAccessToken, { expires: 7 });
      if (newRefreshToken) {
        Cookies.set('refreshToken', newRefreshToken, { expires: 30 });
      }

      // Retry all queued requests with the new token
      processQueue(null, newAccessToken);

      // Retry the original request
      originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Clear session and redirect to login
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tableNames');

      // Redirect to login page (avoid infinite loop if already on login)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export { axiosInstance, BASE_URL };