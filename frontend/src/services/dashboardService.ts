import api from './api';
import { logger } from '../utils/logger';

export interface DashboardStats {
  total_users: number;
  total_posts: number;
  total_admins: number;
}

export interface DashboardUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
  is_admin: boolean;
  posts_count?: number;
}

export interface DashboardPost {
  id: number;
  title: string;
  content: string;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  recent_users: DashboardUser[];
  recent_posts: DashboardPost[];
}

/*
    * DashboardService - Сервис для работы с данными панели администратора
    * Содержит методы для получения статистики, пользователей и управления правами доступа
    */
export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    try {
      logger.log('Dashboard: fetching dashboard data');
      const response = await api.get('/admin/dashboard');
      logger.log('Dashboard: dashboard data fetched successfully', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('Dashboard: failed to fetch dashboard data', error);
      throw error;
    }
  },

  async getUsers(): Promise<DashboardUser[]> {
    try {
      logger.log('Dashboard: fetching all users');
      const response = await api.get('/admin/users');
      logger.log('Dashboard: users fetched successfully', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('Dashboard: failed to fetch users', error);
      throw error;
    }
  },

  async toggleUserAdmin(userId: number): Promise<DashboardUser> {
    try {
      logger.log('Dashboard: toggling admin status for user', { userId });
      const response = await api.patch(`/admin/users/${userId}/toggle-admin`);
      logger.log('Dashboard: admin status toggled successfully', response.data);
      return response.data.user;
    } catch (error: any) {
      logger.error('Dashboard: failed to toggle admin status', { userId, error });
      throw error;
    }
  },
};
