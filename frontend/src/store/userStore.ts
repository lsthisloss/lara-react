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
    
    // Проверяем что нет старых данных перед входом
    const oldToken = localStorage.getItem('auth_token');
    if (oldToken) {
      logger.warn('UserStore: found old token before login, clearing', { oldToken: oldToken.substring(0, 10) + '...' });
      this.clearAllData();
    }
    
    try {
      const { user, token } = await AuthService.login(values);
      localStorage.setItem('auth_token', token);
      
      runInAction(() => {
        this.user = user;
        this.loading = false;
        this.isAuthModalOpen = false;
      });
      
      logger.log('UserStore: login successful', { 
        userId: user.id, 
        userEmail: user.email, 
        isAdmin: user.is_admin,
        tokenPrefix: token.substring(0, 10) + '...'
      });
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
    
    // Очищаем старые данные перед регистрацией
    const oldToken = localStorage.getItem('auth_token');
    if (oldToken) {
      logger.warn('UserStore: found old token before registration, clearing', { oldToken: oldToken.substring(0, 10) + '...' });
      this.clearAllData();
    }
    
    try {
      const { user, token } = await AuthService.register(values);
      localStorage.setItem('auth_token', token);
      
      runInAction(() => {
        this.user = user;
        this.loading = false;
        this.isAuthModalOpen = false;
      });
      
      logger.log('UserStore: register successful', { 
        userId: user.id, 
        userEmail: user.email, 
        isAdmin: user.is_admin,
        tokenPrefix: token.substring(0, 10) + '...'
      });
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
      this.clearAllData();
      
      logger.log('UserStore: logout successful, all data cleared');
      return { success: true };
    } catch (error: any) {
      // Даже если logout на сервере неудачен, очищаем локальные данные
      this.clearAllData();
      
      logger.error('UserStore: logout failed on server, but local data cleared', error);
      return { success: true }; // Возвращаем success, т.к. локально очистили
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
      // При ошибке загрузки пользователя полностью очищаем данные
      this.clearAllData();
      logger.error('UserStore: failed to load user, token invalid', error);
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

  /**
   * Полная очистка всех данных аутентификации и состояния
   * Используется при logout и при обнаружении невалидного токена
   */
  clearAllData() {
    logger.log('UserStore: clearing all authentication data');
    
    // Логируем что было до очистки
    const currentToken = localStorage.getItem('auth_token');
    const currentUser = this.user;
    logger.log('UserStore: current state before clearing', {
      hasToken: !!currentToken,
      tokenPrefix: currentToken?.substring(0, 10) + '...',
      currentUserId: currentUser?.id,
      currentUserEmail: currentUser?.email,
      isAdmin: currentUser?.is_admin
    });
    
    // Очистка localStorage - более агрессивная
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('auth') || 
        key.includes('token') || 
        key.includes('user') || 
        key.includes('admin') ||
        key.includes('session')
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      logger.log(`UserStore: removing localStorage key: ${key}`);
      localStorage.removeItem(key);
    });
    
    // Очистка sessionStorage
    sessionStorage.clear();
    
    // Очистка cookies связанных с auth
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Очистка состояния пользователя
    runInAction(() => {
      this.user = null;
      this.loading = false;
      this.error = null;
      this.isAuthModalOpen = false;
      this.authModalType = 'login';
    });
    
    // Очистка постов
    runInAction(() => {
      this.rootStore.postStore.posts = [];
      this.rootStore.postStore.currentPost = null;
      this.rootStore.postStore.currentPage = 1;
      this.rootStore.postStore.totalPages = 1;
      this.rootStore.postStore.totalPosts = 0;
      this.rootStore.postStore.error = null;
    });
    
    // Очистка dashboard
    runInAction(() => {
      this.rootStore.dashboardStore.dashboardData = null;
      this.rootStore.dashboardStore.users = [];
      this.rootStore.dashboardStore.error = null;
    });
    
    logger.log('UserStore: all data cleared, final state:', {
      hasToken: !!localStorage.getItem('auth_token'),
      userState: this.user,
      localStorageKeys: Object.keys(localStorage)
    });
  }

  get isAuthenticated() {
    return !!this.user;
  }

  get isAdmin() {
    return this.user?.is_admin === true;
  }
}
