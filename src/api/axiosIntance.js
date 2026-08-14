import axios from 'axios';
import Cookies from 'js-cookie';
import i18n from '../libs/i18n';
import { getCookieOptions } from '../utils/auth';

const BASE_URL =
  import.meta.env.VITE_API_MODE === 'development'
    ? import.meta.env.VITE_API_LOCAL_BACKEND_URL
    : import.meta.env.VITE_API_PROD_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      if (config.headers?.set) {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const currentLang = i18n.language || 'tk';
    if (config.headers?.set) {
      config.headers.set('Accept-Language', currentLang);
    } else {
      config.headers = config.headers || {};
      config.headers['Accept-Language'] = currentLang;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

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

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      requestUrl.includes('/auth/signin') ||
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers?.set) {
            originalRequest.headers.set('Authorization', 'Bearer ' + token);
          } else {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
          }
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

      const response = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {
          refreshToken: refreshToken,
          refresh_token: refreshToken,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refreshToken}`,
            'x-refresh-token': refreshToken,
          },
        }
      );

      const newAccessToken =
        response?.data?.data?.accessToken ||
        response?.data?.data?.access_token ||
        response?.data?.accessToken ||
        response?.data?.access_token ||
        response?.data?.token;

      const newRefreshToken =
        response?.data?.data?.refreshToken ||
        response?.data?.data?.refresh_token ||
        response?.data?.refreshToken ||
        response?.data?.refresh_token;

      if (!newAccessToken) {
        throw new Error('No access token in refresh response');
      }

      Cookies.set('accessToken', newAccessToken, getCookieOptions(7));
      if (newRefreshToken) {
        Cookies.set('refreshToken', newRefreshToken, getCookieOptions(30));
      }

      processQueue(null, newAccessToken);

      if (originalRequest.headers?.set) {
        originalRequest.headers.set('Authorization', 'Bearer ' + newAccessToken);
      } else {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
      }

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      const status = refreshError.response?.status;
      const isAuthFailure =
        status === 401 ||
        status === 403 ||
        refreshError.message === 'No refresh token available' ||
        refreshError.message === 'No access token in refresh response';

      if (isAuthFailure) {
        const removeOpts = { path: '/' };
        Cookies.remove('accessToken', removeOpts);
        Cookies.remove('refreshToken', removeOpts);
        localStorage.removeItem('user');
        localStorage.removeItem('tableNames');

        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export { axiosInstance, BASE_URL };