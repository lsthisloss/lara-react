import { makeAutoObservable, runInAction } from 'mobx';
import { AuthService } from '../services/authService';
import UserService from '../services/userService';
import type { User, LoginFormValues, RegisterFormValues, UpdateProfileData, ChangePasswordData } from '../types/interfaces';
import { logger } from '../utils/logger';
import type { RootStore } from '../types/store';
/*
  * UserStore - Хранилище для управления состоянием пользователя
  * Содержит методы для аутентификации, регистрации, обновления профиля и т.д.
*/

export class UserStore {
  rootStore: RootStore;
  user: User | null = null;
  loading = false;
  error: string | null = null;
  isAuthModalOpen = false;
  authModalType: 'login' | 'register' = 'login';

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, { rootStore: false });
    logger.log('UserStore: initialized');
    this.loadUser();
  }
  
  // Открыть модальное окно авторизации
  openAuthModal(type: 'login' | 'register' = 'login') {
    this.isAuthModalOpen = true;
    this.authModalType = type;
    logger.log('UserStore: auth modal opened', { type });
  }
  
  // Закрыть модальное окно авторизации
  closeAuthModal() {
    this.isAuthModalOpen = false;
    logger.log('UserStore: auth modal closed');
  }
  
  // Переключение между формами логина и регистрации
  switchAuthMode(type: 'login' | 'register') {
    this.authModalType = type;
    logger.log('UserStore: auth mode switched', { type });
  }

  async login(values: LoginFormValues) {
    logger.log('UserStore: login attempt', { email: values.email });
    this.loading = true;
    this.error = null;
    
    try {
      const { user, token } = await AuthService.login(values);
      localStorage.setItem('auth_token', token);
      
      runInAction(() => {
        this.user = user;
        this.loading = false;
        this.isAuthModalOpen = false;
      });
      
      logger.log('UserStore: login successful', { userId: user.id });
      return { success: true, user };
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Login failed';
        this.loading = false;
      });
      
      logger.error('UserStore: login failed', error);
      return { success: false, message: this.error };
    }
  }

  async register(values: RegisterFormValues) {
    logger.log('UserStore: register attempt', { email: values.email });
    this.loading = true;
    this.error = null;
    
    try {
      const { user, token } = await AuthService.register(values);
      localStorage.setItem('auth_token', token);
      
      runInAction(() => {
        this.user = user;
        this.loading = false;
        this.isAuthModalOpen = false;
      });
      
      logger.log('UserStore: register successful', { userId: user.id });
      return { success: true, user };
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Registration failed';
        this.loading = false;
      });
      
      logger.error('UserStore: register failed', error);
      return { success: false, message: this.error };
    }
  }

  async logout() {
    logger.log('UserStore: logout attempt');
    this.loading = true;
    
    try {
      await AuthService.logout();
      
      runInAction(() => {
        this.user = null;
        this.loading = false;
      });
      
      logger.log('UserStore: logout successful');
      return { success: true };
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Logout failed';
        this.loading = false;
      });
      
      logger.error('UserStore: logout failed', error);
      return { success: false, message: this.error };
    }
  }

  async loadUser() {
    if (!AuthService.isAuthenticated()) {
      logger.log('UserStore: no token found, skipping user load');
      return;
    }
    
    logger.log('UserStore: loading current user');
    this.loading = true;
    
    try {
      const user = await UserService.getCurrentUser();
      
      runInAction(() => {
        this.user = user;
        this.loading = false;
      });
      
      logger.log('UserStore: user loaded successfully', { userId: user.id });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
        localStorage.removeItem('auth_token');
      });
      
      logger.error('UserStore: failed to load user', error);
    }
  }

  async updateProfile(data: UpdateProfileData) {
    logger.log('UserStore: updating profile', data);
    this.loading = true;
    this.error = null;
    
    try {
      const updatedUser = await UserService.updateProfile(data);
      
      runInAction(() => {
        this.user = updatedUser;
        this.loading = false;
      });
      
      logger.log('UserStore: profile updated successfully');
      return { success: true, user: updatedUser };
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to update profile';
        this.loading = false;
      });
      
      logger.error('UserStore: failed to update profile', error);
      return { success: false, message: this.error };
    }
  }

  async changePassword(data: ChangePasswordData) {
    logger.log('UserStore: changing password');
    this.loading = true;
    this.error = null;
    
    try {
      await UserService.changePassword(data);
      
      runInAction(() => {
        this.loading = false;
      });
      
      logger.log('UserStore: password changed successfully');
      return { success: true };
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to change password';
        this.loading = false;
      });
      
      logger.error('UserStore: failed to change password', error);
      return { success: false, message: this.error };
    }
  }
  
  async getUserProfile(userId: number) {
    logger.log('UserStore: fetching user profile', { userId });
    this.loading = true;
    this.error = null;
    
    try {
      const userProfile = await UserService.getUserProfile(userId);
      
      runInAction(() => {
        this.loading = false;
      });
      
      logger.log('UserStore: user profile fetched successfully');
      return { success: true, user: userProfile };
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to fetch user profile';
        this.loading = false;
      });
      
      logger.error('UserStore: failed to fetch user profile', error);
      return { success: false, message: this.error };
    }
  }

  get isAuthenticated() {
    return !!this.user;
  }

  get isAdmin() {
    return this.user?.is_admin === true;
  }
}
