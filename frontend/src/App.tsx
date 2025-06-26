import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { ConfigProvider, App as AntdApp } from 'antd';
import { useUserStore } from './hooks/useStore';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PostsPage from './pages/PostsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';
import { logger } from './utils/logger';
import './styles/index.scss';

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
      <AntdApp>
        <Router>
          <Routes>
            <Route
              path="/auth"
              element={
                userStore.isAuthenticated ? (
                  <Navigate to="/posts" replace />
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
                      <Route path="/" element={<Navigate to="/posts" replace />} />
                      <Route 
                        path="/dashboard" 
                        element={
                          userStore.isAdmin ? (
                            <Dashboard />
                          ) : (
                            <Navigate to="/posts" replace />
                          )
                        } 
                      />
                      <Route path="/posts" element={<PostsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/profile/:userId" element={<ProfilePage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </Layout>
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
          </Routes>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
});

export default App;
