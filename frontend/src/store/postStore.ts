import { makeAutoObservable, runInAction } from 'mobx';
import { PostService } from '../services/postService';
import type { Post } from '../types/interfaces';
import { logger } from '../utils/logger';
import type { RootStore } from '../types/store';

export class PostStore {
  rootStore: RootStore;
  posts: Post[] = [];
  currentPost: Post | null = null;
  loading = false;
  error: string | null = null;
  
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

  async fetchPosts() {
    logger.log('PostStore: fetching all posts');
    this.loading = true;
    this.error = null;
    
    try {
      const posts = await PostService.getAllPosts();
      
      runInAction(() => {
        this.posts = posts;
        this.loading = false;
      });
      
      logger.log(`PostStore: fetched ${posts.length} posts`);
      return posts;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to fetch posts';
        this.loading = false;
      });
      
      logger.error('PostStore: failed to fetch posts', error);
      return [];
    }
  }

  // Алиас для fetchPosts для совместимости
  async loadPosts() {
    return this.fetchPosts();
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
        this.posts = [post, ...this.posts];
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
      await PostService.deletePost(id);
      
      runInAction(() => {
        this.posts = this.posts.filter(p => p.id !== id);
        if (this.currentPost?.id === id) {
          this.currentPost = null;
        }
        this.loading = false;
      });
      
      logger.log(`PostStore: post ${id} deleted successfully`);
      return true;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Failed to delete post';
        this.loading = false;
      });
      
      logger.error(`PostStore: failed to delete post ${id}`, error);
      return false;
    }
  }
}
