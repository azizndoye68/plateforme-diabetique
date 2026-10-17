import axios from 'axios';

export const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise = null;

const isAuthRequest = (url = '') =>
  ['/api/auth/login', '/api/auth/register', '/api/auth/refresh-token'].some((path) => url.includes(path));

const clearSession = () => {
  ['token', 'refreshToken', 'utilisateurId', 'role'].forEach((key) => localStorage.removeItem(key));
  if (window.location.pathname !== '/login') window.location.assign('/login');
};

api.interceptors.request.use((config) => {
  if (!isAuthRequest(config.url)) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isAuthRequest(originalRequest.url)) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      clearSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = axios.post(`${API_BASE_URL}/api/auth/refresh-token`, { refreshToken })
          .finally(() => { refreshPromise = null; });
      }
      const { accessToken, refreshToken: rotatedRefreshToken } = (await refreshPromise).data;
      if (!accessToken || !rotatedRefreshToken) throw new Error('Réponse de renouvellement invalide');

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', rotatedRefreshToken);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearSession();
      return Promise.reject(refreshError);
    }
  },
);

export default api;
