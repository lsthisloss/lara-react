import { logger } from '../utils/logger';

/**
 * Класс для управления зависимостями в приложении
 */
export class DependencyContainer {
  private static instance: DependencyContainer;
  private dependencies: Map<string, any> = new Map();

  private constructor() {
    logger.log('DependencyContainer initialized');
  }

  /**
   * Получить единственный экземпляр контейнера
   */
  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  /**
   * Зарегистрировать зависимость
   */
  public register<T>(key: string, dependency: T): void {
    logger.log(`Registering dependency: ${key}`);
    this.dependencies.set(key, dependency);
  }

  /**
   * Получить зависимость
   */
  public resolve<T>(key: string): T {
    const dependency = this.dependencies.get(key);
    
    if (!dependency) {
      logger.error(`Dependency not found: ${key}`);
      throw new Error(`Dependency not found: ${key}`);
    }
    
    return dependency as T;
  }
}

export const container = DependencyContainer.getInstance();
export default container;
