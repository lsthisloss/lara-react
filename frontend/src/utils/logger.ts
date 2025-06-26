/**
 * Простой класс логгера для отладки приложения
 */
export class Logger {
  private readonly isDebugEnabled: boolean;
  private readonly namespace: string;
  private static instance: Logger;
  
  private constructor(namespace: string) {
    this.namespace = namespace;
    this.isDebugEnabled = 
      import.meta.env.MODE !== 'production' || 
      localStorage.getItem('debug') === 'true';
  }
  
  /**
   * Получить экземпляр логгера
   */
  public static getInstance(namespace = 'App'): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(namespace);
    }
    return Logger.instance;
  }
  
  /**
   * Логирование информации
   */
  public log(...args: any[]): void {
    if (this.isDebugEnabled) {
      console.log(`[${this.namespace}]`, ...args);
    }
  }
  
  /**
   * Логирование предупреждений
   */
  public warn(...args: any[]): void {
    if (this.isDebugEnabled) {
      console.warn(`[${this.namespace}]`, ...args);
    }
  }
  
  /**
   * Логирование ошибок
   */
  public error(...args: any[]): void {
    console.error(`[${this.namespace}]`, ...args);
  }
  
  /**
   * Логирование событий в формате JSON
   */
  public logEvent(eventName: string, data?: Record<string, any>): void {
    if (this.isDebugEnabled) {
      console.log(`[${this.namespace}] EVENT: ${eventName}`, data ? JSON.stringify(data) : '');
    }
  }
  
  /**
   * Начало отслеживания времени выполнения
   */
  public time(label: string): void {
    if (this.isDebugEnabled) {
      console.time(`[${this.namespace}] ${label}`);
    }
  }
  
  /**
   * Окончание отслеживания времени выполнения
   */
  public timeEnd(label: string): void {
    if (this.isDebugEnabled) {
      console.timeEnd(`[${this.namespace}] ${label}`);
    }
  }
}

export const logger = Logger.getInstance();
export default logger;
