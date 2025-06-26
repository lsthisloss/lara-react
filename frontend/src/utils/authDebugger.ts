/**
 * Отладочная утилита для проверки состояния аутентификации
 */

export class AuthDebugger {
  static logCurrentState() {
    console.group('🔍 Auth Debug State');
    
    // localStorage
    console.log('📦 localStorage:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key!);
      console.log(`  ${key}: ${value}`);
    }
    
    // sessionStorage
    console.log('🗂️ sessionStorage:');
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key!);
      console.log(`  ${key}: ${value}`);
    }
    
    // cookies
    console.log('🍪 cookies:');
    console.log(document.cookie);
    
    // API token check
    const token = localStorage.getItem('auth_token');
    if (token) {
      console.log('🔑 Token found:', token.substring(0, 20) + '...');
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔓 Token payload:', payload);
      } catch (e) {
        console.log('❌ Token is not JWT format');
      }
    } else {
      console.log('❌ No token found');
    }
    
    console.groupEnd();
  }
  
  static clearEverything() {
    console.log('🧹 Clearing all auth data...');
    
    // Clear localStorage
    const lsKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      lsKeys.push(localStorage.key(i));
    }
    lsKeys.forEach(key => {
      if (key) {
        console.log(`Removing localStorage: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('✅ All auth data cleared');
  }
}

// Глобальный доступ для отладки
(window as any).authDebug = AuthDebugger;
