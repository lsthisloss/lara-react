import apiClient from './api';
import type { LoginFormValues, RegisterFormValues, User } from '../types/interfaces';

export const AuthService = {
  login: async (data: LoginFormValues): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post('/login', data);
    return response.data;
  },

  register: async (data: RegisterFormValues): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post('/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/logout');
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/user');
    return response.data;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  }
};
