import { makeAutoObservable, runInAction } from 'mobx';
import { PostService } from '../services/postService';
import type { Post } from '../types/interfaces';
import { logger } from '../utils/logger';
import type { RootStore } from '../types/store';

/*
  * PostStore - Хранилище для управления состоянием постов
  * Содержит методы для получения, создания, обновления и удаления постов
*/

export class PostStore {
  rootStore: RootStore;
  posts: Post[] = [];
  currentPost: Post | null = null;
  loading = false;
  error: string | null = null;
  
  // Pagination state
  currentPage = 1;
  totalPages = 1;
  totalPosts = 0;
  perPage = 10;
  
  // Состояние для модальных окон и форм
  isPostModalOpen = false;
  editingPost: Post | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, { rootStore: false });
    logger.log('PostStore: initialized');
  }
  
  // Открыть модальное окно создания/редактирования поста
  openPostModal(post: Post | null = null) {
    this.isPostModalOpen = true;
    this.editingPost = post;
    logger.log('PostStore: post modal opened', { isEditing: !!post });
  }
  
  // Закрыть модальное окно создания/редактирования поста
  closePostModal() {
    this.isPostModalOpen = false;
    this.editingPost = null;
    logger.log('PostStore: post modal closed');
  }

  async fetchPosts(page: number = 1) {
    logger.log(`PostStore: fetching posts for page ${page}`);
    this.loading = true;
    this.error = null;
    
    try {
      const response = await PostService.getAllPosts(page, this.perPage);
      
      runInAction(() => {
        this.posts = response.data;
        this.currentPage = response.meta.current_page;
        this.totalPages = response.meta.last_page;
        this.totalPosts = response.meta.total;
        this.loading = false;
      });
      
      logger.log(`PostStore: fetched ${response.data.length} posts for page ${page}, total: ${response.meta.total}`);
      return response;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to fetch posts';
        this.loading = false;
      });
      
      logger.error('PostStore: failed to fetch posts', error);
      return null;
    }
  }

  // Legacy method for components that don't use pagination yet
  async fetchAllPosts() {
    logger.log('PostStore: fetching all posts (legacy)');
    this.loading = true;
    this.error = null;
    
    try {
      const posts = await PostService.getAllPostsLegacy();
      
      runInAction(() => {
        this.posts = posts;
        this.loading = false;
      });
      
      logger.log(`PostStore: fetched ${posts.length} posts (legacy)`);
      return posts;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to fetch posts';
        this.loading = false;
      });
      
      logger.error('PostStore: failed to fetch posts (legacy)', error);
      return [];
    }
  }

  // Алиас для fetchPosts для совместимости
  async loadPosts(page: number = 1) {
    return this.fetchPosts(page);
  }

  async fetchPostById(id: number) {
    logger.log(`PostStore: fetching post by id ${id}`);
    this.loading = true;
    this.error = null;
    
    try {
      const post = await PostService.getPostById(id);
      
      runInAction(() => {
        this.currentPost = post;
        this.loading = false;
      });
      
      logger.log(`PostStore: fetched post ${id}`, { title: post.title });
      return post;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to fetch post';
        this.loading = false;
      });
      
      logger.error(`PostStore: failed to fetch post ${id}`, error);
      return null;
    }
  }

  async createPost(data: { title: string; content: string }) {
    logger.log('PostStore: creating new post', { title: data.title });
    this.loading = true;
    this.error = null;
    
    try {
      const post = await PostService.createPost(data);
      
      runInAction(() => {
        // Add the new post to the beginning of the current page
        this.posts = [post, ...this.posts];
        // Update total count
        this.totalPosts += 1;
        this.loading = false;
        this.isPostModalOpen = false;
      });
      
      logger.log('PostStore: post created successfully', { id: post.id, title: post.title });
      return post;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to create post';
        this.loading = false;
      });
      
      logger.error('PostStore: failed to create post', error);
      return null;
    }
  }

  async updatePost(id: number, data: { title: string; content: string }) {
    logger.log(`PostStore: updating post ${id}`, { title: data.title });
    this.loading = true;
    this.error = null;
    
    try {
      const post = await PostService.updatePost(id, data);
      
      runInAction(() => {
        this.posts = this.posts.map(p => p.id === id ? post : p);
        if (this.currentPost?.id === id) {
          this.currentPost = post;
        }
        this.loading = false;
        this.isPostModalOpen = false;
        this.editingPost = null;
      });
      
      logger.log(`PostStore: post ${id} updated successfully`, { title: post.title });
      return post;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to update post';
        this.loading = false;
      });
      
      logger.error(`PostStore: failed to update post ${id}`, error);
      return null;
    }
  }

  async deletePost(id: number) {
    logger.log(`PostStore: deleting post ${id}`);
    this.loading = true;
    this.error = null;
    
    try {
      console.log(`Attempting to delete post with ID: ${id}`);
      const success = await PostService.deletePost(id);
      console.log(`Delete API result for post ${id}:`, success);
      
      if (success) {
        runInAction(() => {
          // Filter out the deleted post from the posts array
          const filteredPosts = this.posts.filter(p => p.id !== id);
          console.log(`Filtered posts after deletion - Before: ${this.posts.length}, After: ${filteredPosts.length}`);
          this.posts = filteredPosts;
          
          // Update total count
          this.totalPosts = Math.max(0, this.totalPosts - 1);
          
          if (this.currentPost?.id === id) {
            this.currentPost = null;
          }
          this.loading = false;
        });
        
        logger.log(`PostStore: post ${id} deleted successfully`);
        return true;
      } else {
        runInAction(() => {
          this.error = 'Failed to delete post';
          this.loading = false;
        });
        
        logger.error(`PostStore: failed to delete post ${id} - API returned failure`);
        return false;
      }
    } catch (error: any) {
      console.error(`Error in deletePost for ID ${id}:`, error);
      console.error('Error details:', {
        response: error.response,
        message: error.message,
        stack: error.stack
      });
      
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to delete post';
        this.loading = false;
      });
      
      logger.error(`PostStore: failed to delete post ${id}`, error);
      throw error; // Rethrow to handle in component
    }
  }
}
