import apiClient from './api';
import type { Post, PaginatedResponse } from '../types/interfaces';

/*
  * PostService - Сервис для работы с постами
  * Содержит методы для получения, создания, обновления и удаления постов
  */

export const PostService = {
  getAllPosts: async (page: number = 1, perPage: number = 10): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get(`posts?page=${page}&per_page=${perPage}`);
    return response.data;
  },

  getAllPostsLegacy: async (): Promise<Post[]> => {
    const response = await apiClient.get('posts');
    // API возвращает PostResource collection, который может быть пагинированным
    return response.data.data || response.data;
  },

  getPostById: async (id: number): Promise<Post> => {
    const response = await apiClient.get(`posts/${id}`);
    return response.data.data || response.data;
  },

  createPost: async (data: { title: string; content: string }): Promise<Post> => {
    const response = await apiClient.post('posts', data);
    return response.data.data || response.data;
  },

  updatePost: async (id: number, data: { title: string; content: string }): Promise<Post> => {
    const response = await apiClient.put(`posts/${id}`, data);
    return response.data.data || response.data;
  },

  deletePost: async (id: number): Promise<boolean> => {
    try {
      console.log('PostService: Deleting post with ID:', id);
      console.log('PostService: DELETE request to URL:', `posts/${id}`);
      
      // Отладочная информация перед удалением
      const token = localStorage.getItem('auth_token');
      console.log('Auth token present:', !!token);
      
      // First make sure we have a CSRF token
      const response = await apiClient.delete(`posts/${id}`);
      console.log('PostService: Delete response:', response.status, response.data);
      return response.status === 200 || response.status === 204;
    } catch (error: any) {
      console.error('PostService: Error deleting post:', error);
      console.error('PostService: Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error; // Выбрасываем ошибку, чтобы ее увидеть в компоненте
    }
  }
};
