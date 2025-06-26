import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { ConfigProvider } from 'antd';
import { useUserStore } from './hooks/useStore';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import { logger } from './utils/logger';
import './App.css';

const App = observer(() => {
  const userStore = useUserStore();

  logger.log('App: rendering with auth state', { 
    isAuthenticated: userStore.isAuthenticated,
    loading: userStore.loading 
  });

  // Показываем загрузку пока проверяется токен
  if (userStore.loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Router>
        <Routes>
          <Route
            path="/auth"
            element={
              userStore.isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <AuthPage />
              )
            }
          />
          <Route
            path="/*"
            element={
              userStore.isAuthenticated ? (
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
        </Routes>
      </Router>
    </ConfigProvider>
  );
});

export default App;
