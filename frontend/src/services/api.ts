import axios from 'axios';
/*
  * api.ts - Настройка Axios для работы с API
  * Этот файл содержит конфигурацию Axios, включая базовый URL, заголовки и обработку CSRF токенов.
  * Он также содержит перехватчики для логирования запросов и ответов.
  */


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

// Создаем экземпляр axios с базовым URL и заголовками
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Важно для работы с cookies и CSRF
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Функция для получения CSRF токена
export const getCsrfToken = async () => {
  try {
    await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    throw error;
  }
};

// Вспомогательная функция для получения значения cookie
const getCookieValue = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// Перехватчик для добавления токена к запросам
apiClient.interceptors.request.use(
  async (config) => {
    // Удаляем начальный слеш из URL, если он есть
    if (config.url && config.url.startsWith('/')) {
      config.url = config.url.substring(1);
    }
    
    // Для POST, PUT, DELETE запросов получаем CSRF токен
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
      try {
        await getCsrfToken();
        
        // Получаем XSRF токен из cookies и добавляем в заголовки
        const xsrfToken = getCookieValue('XSRF-TOKEN');
        if (xsrfToken) {
          config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
        }
      } catch (error) {
        console.error('Failed to get CSRF token:', error);
      }
    }
    
    // Добавляем Bearer токен
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API] Request to ${config.url} with token: ${token.substring(0, 10)}...`);
    } else {
      console.log(`[API] Request to ${config.url} without token`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Перехватчик для обработки ответов
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Если ошибка 401 (неавторизован), очищаем токен
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    
    // Если ошибка 419 (CSRF token mismatch), пытаемся обновить токен и повторить запрос
    if (error.response && error.response.status === 419) {
      return getCsrfToken().then(() => {
        return apiClient.request(error.config);
      }).catch(() => Promise.reject(error));
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
