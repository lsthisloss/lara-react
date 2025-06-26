import apiClient from './api';
import type { LoginFormValues, RegisterFormValues, User } from '../types/interfaces';
import { logger } from '../utils/logger';

/*
  * AuthService - Сервис для работы с аутентификацией пользователей
  * Содержит методы для входа, регистрации, выхода и проверки аутентификации
  */
 
export const AuthService = {
  /**
   * Вход в систему
   */
  login: async (data: LoginFormValues): Promise<{ user: User; token: string }> => {
    logger.log('AuthService: login attempt', { email: data.email });
    const response = await apiClient.post('login', data);
    return response.data;
  },

  /**
   * Регистрация нового пользователя
   */
  register: async (data: RegisterFormValues): Promise<{ user: User; token: string }> => {
    logger.log('AuthService: register attempt', { email: data.email });
    const response = await apiClient.post('register', data);
    return response.data;
  },

  /**
   * Выход из системы
   */
  logout: async (): Promise<void> => {
    logger.log('AuthService: logout attempt');
    await apiClient.post('logout');
    
    // Полная очистка всех данных аутентификации
    localStorage.removeItem('auth_token');
    // Очистка всех данных пользователя (если есть другие ключи)
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('user_') || key.startsWith('auth_') || key.includes('admin')) {
        localStorage.removeItem(key);
      }
    });
    
    // Очистка sessionStorage
    sessionStorage.clear();
  },

  /**
   * Проверка аутентификации пользователя
   */
  isAuthenticated: (): boolean => {
    const hasToken = !!localStorage.getItem('auth_token');
    logger.log('AuthService: checking authentication', { isAuthenticated: hasToken });
    return hasToken;
  }
};
