import axios from "axios";

import { useAuthStore } from "../stores/useAuthStore";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
  const { response, config } = error;
    const originalRequest = config as any;
    if (response?.status === 401 && !originalRequest?.__isRetryRequest) {
      const { refreshToken, logout, setTokens } = useAuthStore.getState();
      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = apiClient
          .post<{ access_token: string; refresh_token?: string }>("/auth/refresh", {
            refresh_token: refreshToken,
          })
          .then(({ data }) => {
            setTokens(data.access_token, data.refresh_token);
            return data.access_token;
          })
          .catch((err) => {
            logout();
            throw err;
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }
      try {
        const newToken = await refreshPromise;
        if (newToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.__isRetryRequest = true;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
