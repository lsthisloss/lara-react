import { makeAutoObservable, runInAction } from 'mobx';
import { dashboardService } from '../services/dashboardService';
import type { DashboardData, DashboardUser } from '../services/dashboardService';
import { logger } from '../utils/logger';

/*
    * DashboardStore - Хранилище для управления состоянием панели администратора
    * Содержит методы для получения данных панели, пользователей и управления правами доступа
*/

export class DashboardStore {
  dashboardData: DashboardData | null = null;
  users: DashboardUser[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadDashboardData() {
    try {
      this.loading = true;
      this.error = null;
      logger.log('DashboardStore: loading dashboard data');
      
      const data = await dashboardService.getDashboardData();
      runInAction(() => {
        this.dashboardData = data;
      });
      logger.log('DashboardStore: dashboard data loaded successfully', this.dashboardData);
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.response?.data?.message || 'Failed to load dashboard data';
      });
      logger.error('DashboardStore: failed to load dashboard data', { error: this.error, fullError: error });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async loadUsers() {
    try {
      this.loading = true;
      this.error = null;
      logger.log('DashboardStore: loading users');
      
      const users = await dashboardService.getUsers();
      runInAction(() => {
        this.users = users;
      });
      logger.log('DashboardStore: users loaded successfully', this.users);
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.response?.data?.message || 'Failed to load users';
      });
      logger.error('DashboardStore: failed to load users', { error: this.error, fullError: error });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async toggleUserAdmin(userId: number) {
    try {
      logger.log('DashboardStore: toggling admin status', { userId });
      
      const updatedUser = await dashboardService.toggleUserAdmin(userId);
      
      runInAction(() => {
        // Update user in the users array
        const userIndex = this.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
          this.users[userIndex] = { ...this.users[userIndex], ...updatedUser };
        }
      });
      
      // Reload dashboard data to update stats
      await this.loadDashboardData();
      
      logger.log('DashboardStore: admin status toggled successfully', { userId, updatedUser });
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.response?.data?.message || 'Failed to toggle admin status';
      });
      logger.error('DashboardStore: failed to toggle admin status', { userId, error: this.error, fullError: error });
      throw error;
    }
  }

  clearError() {
    runInAction(() => {
      this.error = null;
    });
  }
}

export const dashboardStore = new DashboardStore();
