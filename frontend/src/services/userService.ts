import apiClient from './api';
import type { User, UpdateProfileData, ChangePasswordData } from '../types/interfaces';
import { logger } from '../utils/logger';

/*
    * UserService - Сервис для работы с пользователями
    * Содержит методы для получения, обновления профиля, смены пароля и т.д.
*/

const UserService = {
  /**
   * Получить данные текущего аутентифицированного пользователя
   */
  getCurrentUser: async (): Promise<User> => {
    logger.log('UserService: fetching current user data');
    const response = await apiClient.get('user');
    return response.data;
  },

  /**
   * Обновить профиль пользователя (имя, email)
   */
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    logger.log('UserService: updating user profile', { data });
    console.log('UserService: PUT request to URL:', 'user/profile', data);
    
    try {
      // Make sure the endpoint matches exactly what's defined in the API routes
      const response = await apiClient.put('user/profile', data);
      console.log('UserService: Update profile response:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('UserService: Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Изменить пароль пользователя
   */
  changePassword: async (data: ChangePasswordData): Promise<boolean> => {
    logger.log('UserService: changing user password');
    console.log('UserService: PUT request to URL:', 'user/password');
    
    try {
      // Make sure the endpoint matches exactly what's defined in the API routes
      const response = await apiClient.put('user/password', data);
      console.log('UserService: Change password response:', response.status);
      return response.status === 200;
    } catch (error) {
      console.error('UserService: Error changing password:', error);
      throw error;
    }
  },

  /**
   * Получить публичный профиль пользователя по ID
   */
  getUserProfile: async (userId: number): Promise<User> => {
    logger.log('UserService: fetching user profile', { userId });
    console.log('UserService: GET request to URL:', `users/${userId}/profile`);
    
    try {
      // Make sure the endpoint matches exactly what's defined in the API routes
      const response = await apiClient.get(`users/${userId}/profile`);
      console.log('UserService: Get user profile response:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('UserService: Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Получить список пользователей (для админки)
   */
  getAllUsers: async (): Promise<User[]> => {
    logger.log('UserService: fetching all users');
    const response = await apiClient.get('users');
    return response.data.data || response.data;
  }
};

export default UserService;
