import axios from 'axios';

// Determine the API URLs based on environment
const getApiUrls = () => {
  // If we're in a Docker container, use container networking
  const isDocker = window.location.hostname === 'localhost' && window.location.port === '3000';
  
  if (isDocker) {
    // When frontend is accessed via localhost:3000, backend should be localhost:8000
    return {
      API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
      BASE_URL: import.meta.env.VITE_BASE_URL || 'http://localhost:8000'
    };
  } else {
    // Default URLs from environment
    return {
      API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
      BASE_URL: import.meta.env.VITE_BASE_URL || 'http://localhost:8000'
    };
  }
};

const { API_URL, BASE_URL } = getApiUrls();

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
    console.log(`Fetching CSRF token from: ${BASE_URL}/sanctum/csrf-cookie`);
    await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
    console.log('CSRF token fetched successfully');
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
    throw error;
  }
};

// Перехватчик для добавления токена к запросам
apiClient.interceptors.request.use(
  async (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    
    // Для POST, PUT, DELETE запросов получаем CSRF токен
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
      console.log('Getting CSRF token for', config.method, 'request');
      try {
        await getCsrfToken();
        
        // Получаем XSRF токен из cookies и добавляем в заголовки
        const xsrfToken = getCookieValue('XSRF-TOKEN');
        if (xsrfToken) {
          config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
          console.log('Added X-XSRF-TOKEN header');
        } else {
          console.warn('XSRF-TOKEN cookie not found');
        }
      } catch (error) {
        console.error('Failed to get CSRF token, continuing with request:', error);
      }
    }
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added bearer token to request');
    }
    
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      withCredentials: config.withCredentials,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Вспомогательная функция для получения значения cookie
const getCookieValue = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// Перехватчик для обработки ответов
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Response received from ${response.config.url}:`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Если ошибка 401 (неавторизован), очищаем токен и перенаправляем на страницу входа
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    
    // Если ошибка 419 (CSRF token mismatch), пытаемся обновить токен и повторить запрос
    if (error.response && error.response.status === 419) {
      console.log('CSRF token mismatch, trying to refresh token and retry');
      return getCsrfToken().then(() => {
        // Повторяем запрос с новым CSRF токеном
        return apiClient.request(error.config);
      }).catch(retryError => {
        console.error('Failed to retry request after CSRF refresh:', retryError);
        return Promise.reject(error);
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
