import axios from 'axios';
import { getStoredTokens, setStoredTokens, clearAuthStorage } from './storage';

// Create axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const tokens = getStoredTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If error is not 401 or request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const tokens = getStoredTokens();

    try {
      // Attempt to refresh the token
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
        refreshToken: tokens?.refreshToken,
      });

      const { accessToken, refreshToken } = response.data;
      setStoredTokens({ accessToken, refreshToken });

      // Retry the original request with new token
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // If refresh fails, clear tokens and reject
      clearAuthStorage();
      return Promise.reject(refreshError);
    }
  }
);
