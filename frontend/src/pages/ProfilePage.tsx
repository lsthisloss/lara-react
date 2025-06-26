import { Card, Avatar, message, Typography, Divider, Spin, Button } from 'antd';
import { observer } from 'mobx-react-lite';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserStore } from '../hooks/useStore';
import { logger } from '../utils/logger';
import type { User } from '../types/interfaces';
import '../styles/_profile.scss';

const { Title } = Typography;

/*
  * ProfilePage - Страница профиля пользователя
  * Позволяет просматривать профиль другого пользователя или свой собственный
  * Использует MobX для управления состоянием пользователя
  */
const ProfilePage = observer(() => {
  const userStore = useUserStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const { userId } = useParams<{ userId?: string }>();
  
  // Use useMemo to calculate isOwnProfile to prevent recalculations on every render
  const isOwnProfile = useMemo(() => {
    return !userId || (userStore.user && parseInt(userId) === userStore.user.id);
  }, [userId, userStore.user]);
  
  // Загрузка профиля пользователя по ID
  useEffect(() => {
    let isMounted = true; // For cleanup to prevent state updates after unmount
    
    async function loadUserProfile() {
      if (userId && !isOwnProfile) {
        if (isMounted) setLoading(true);
        try {
          // Convert userId to number only once to avoid unnecessary re-renders
          const userIdNum = parseInt(userId);
          
          // Используем прямой вызов API вместо userStore.getUserProfile() 
          // чтобы избежать изменения userStore.loading
          const response = await fetch(`http://localhost:8000/api/users/${userIdNum}/profile`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });
          
          if (response.ok) {
            const user = await response.json();
            if (isMounted) {
              setProfileUser(user);
              logger.log('ProfilePage: user profile loaded successfully', { userId: userIdNum });
            }
          } else {
            throw new Error('Failed to fetch user profile');
          }
        } catch (error) {
          logger.error('ProfilePage: failed to load user profile', error);
          if (isMounted) {
            message.error('Failed to load user profile');
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      } else {
        // Если свой профиль, используем данные из стора
        if (isMounted) {
          setProfileUser(userStore.user);
        }
      }
    }
    
    loadUserProfile();
    
    // Cleanup function to prevent memory leaks and unnecessary state updates
    return () => {
      isMounted = false;
    };
  }, [userId, isOwnProfile, userStore.user?.id]); // Добавляем userStore.user?.id для отслеживания изменений
  
  // Переход на страницу настроек для изменения своих данных
  const goToSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <Title level={2}>{isOwnProfile ? 'My Profile' : 'User Profile'}</Title>
        <p>{isOwnProfile ? 'View your account information' : 'Viewing user profile'}</p>
      </div>

      {loading ? (
        <div className="profile-loading">
          <Spin size="large" />
        </div>
      ) : (
        <div className="profile-content">
          <Card className="profile-card">
            <div className="profile-avatar-section">
              <Avatar 
                size={80}
                style={{ 
                  backgroundColor: '#1890ff',
                  fontSize: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {(profileUser?.name || '').charAt(0).toUpperCase() || <UserOutlined />}
              </Avatar>
              <div style={{ marginLeft: 16 }}>
                <h2>{profileUser?.name}</h2>
                <p>{profileUser?.email}</p>
              </div>
              {isOwnProfile && (
                <Button 
                  type="primary"
                  icon={<SettingOutlined />}
                  onClick={goToSettings}
                  className="settings-button"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            <Divider />
            
            <div className="profile-details">
              <div className="profile-detail-item">
                <strong>Member since:</strong> 
                <span>{profileUser?.created_at ? new Date(profileUser.created_at).toLocaleDateString() : 'Unknown'}</span>
              </div>
              {/* Здесь можно добавить дополнительные публичные поля профиля */}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
});

export default ProfilePage;
