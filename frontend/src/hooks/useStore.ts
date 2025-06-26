import rootStore from '../store/index';

/**
 * Хук для доступа к корневому хранилищу
 */
export const useStore = () => rootStore;

/**
 * Хук для доступа к хранилищу пользователей
 */
export const useUserStore = () => rootStore.userStore;

/**
 * Хук для доступа к хранилищу постов
 */
export const usePostStore = () => rootStore.postStore;

/**
 * Хук для доступа к хранилищу дашборда
 */
export const useDashboardStore = () => rootStore.dashboardStore;
