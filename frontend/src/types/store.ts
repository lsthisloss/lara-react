import { UserStore } from '../store/userStore';
import { PostStore } from '../store/postStore';

// Root store interface
export interface RootStore {
  userStore: UserStore;
  postStore: PostStore;
}
