import { makeAutoObservable, runInAction } from 'mobx';
import { AuthService } from '../services/authService';
import type { User, LoginFormValues, RegisterFormValues } from '../types/interfaces';
import { logger } from '../utils/logger';
import type { RootStore } from '../types/store';

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
      const user = await AuthService.getCurrentUser();
      
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

  get isAuthenticated() {
    return !!this.user;
  }
}
