import { UserStore } from '../store/userStore';
import { PostStore } from '../store/postStore';
import { DashboardStore } from '../store/dashboardStore';

// Root store interface
export interface RootStore {
  userStore: UserStore;
  postStore: PostStore;
  dashboardStore: DashboardStore;
}
