import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import Cookies from 'js-cookie';
import i18n from '../i18n/i18n.config';

const getBaseURL = () => {
  const language = i18n.language || 'vi';
  return `${import.meta.env.VITE_API_BASE_URL}/${language}`;
};

// Create an Axios instance
const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

// Update baseURL when language changes
i18n.on('languageChanged', () => {
  api.defaults.baseURL = getBaseURL();
});

// Type for failed queue items
interface FailedQueueItem {
  resolve: (token: string) => void;
  reject: (err: AxiosError) => void;
}

// Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      } as any;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor with refresh token logic
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      window.location.pathname !== '/login'
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`,
              } as any;
              resolve(api(originalRequest));
            },
            reject: (err: AxiosError) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${getBaseURL()}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = refreshResponse.data.data || {};
        if (accessToken) {
          Cookies.set('accessToken', accessToken);
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${accessToken}`,
          } as any;
          processQueue(null, accessToken);
          return api(originalRequest);
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response) {
      switch (error.response.status) {
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('An error occurred:', error.message);
      }
    } else if (error.request) {
      console.error('Network error - no response received');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;