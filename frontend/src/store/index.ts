import { makeAutoObservable } from 'mobx';
import { UserStore } from './userStore';
import { PostStore } from './postStore';
import { dashboardStore } from './dashboardStore';
import { logger } from '../utils/logger';

/**
 * Корневой класс хранилища, который объединяет все дочерние хранилища
 */
class RootStore {
  userStore: UserStore;
  postStore: PostStore;
  dashboardStore = dashboardStore;

  constructor() {
    logger.log('RootStore: Initializing');
    
    this.userStore = new UserStore(this);
    this.postStore = new PostStore(this);
    
    makeAutoObservable(this);
    
    logger.log('RootStore: Initialized successfully');
  }
}

// Создаем единственный экземпляр хранилища
const rootStore = new RootStore();

export default rootStore;
