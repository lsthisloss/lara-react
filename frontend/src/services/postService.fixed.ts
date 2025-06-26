import apiClient from './api';
import type { Post } from '../types/interfaces';

export const PostService = {
  getAllPosts: async (): Promise<Post[]> => {
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
      const response = await apiClient.delete(`posts/${id}`);
      console.log('PostService: Delete response:', response.status, response.data);
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error('PostService: Error deleting post:', error);
      throw error; // Rethrow to see detailed error in console
    }
  }
};

export default PostService;
