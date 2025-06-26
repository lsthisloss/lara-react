import { Layout as AntdLayout, Button, Avatar, Dropdown, Space, Typography, Drawer } from 'antd';
import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../hooks/useStore';
import { logger } from '../utils/logger';
import type { MenuProps } from 'antd';
import Sidebar from './Sidebar';

const { Header, Content } = AntdLayout;
const { Title } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = observer(({ children }: LayoutProps) => {
  const userStore = useUserStore();
  const navigate = useNavigate();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuVisible(prev => !prev);
    logger.log(`Layout: mobile menu ${mobileMenuVisible ? 'closed' : 'opened'}`);
  };
  
  // Effect to handle closing menu when resizing window
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuVisible) {
        setMobileMenuVisible(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuVisible]);

  const handleLogout = async () => {
    logger.log('Layout: logout requested');
    await userStore.logout();
    
    // Независимо от результата logout на сервере, всегда перенаправляем на страницу авторизации
    // и очищаем любые остатки данных
    navigate('/auth');
    
    // Дополнительная очистка на всякий случай
    setTimeout(() => {
      if (localStorage.getItem('auth_token')) {
        logger.warn('Layout: auth_token still present after logout, clearing manually');
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload(); // Принудительная перезагрузка
      }
    }, 100);
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => {
        navigate('/profile');
        logger.log('Layout: navigate to profile');
      }
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => {
        navigate('/settings');
        logger.log('Layout: navigate to settings');
      }
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    }
  ];

  return (
    <AntdLayout className="app-layout">
      <Header className="layout-header">
        <div className="header-left">
          <Button
            type="text"
            icon={mobileMenuVisible ? <CloseOutlined /> : <MenuOutlined />}
            onClick={toggleMobileMenu}
            className="mobile-menu-trigger"
          />
          <Title level={5} className="logo">
            Pobably React!
          </Title>
        </div>
        
        <Space className="header-right">
          <span className="user-info">Welcome, {userStore.user?.name}</span>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" className="user-avatar">
              <Avatar 
                icon={<UserOutlined />} 
                size="small"
                style={{ backgroundColor: '#1890ff' }}
              />
            </Button>
          </Dropdown>
        </Space>
      </Header>
      
      <AntdLayout>
        {/* Desktop Sidebar */}
        <Sidebar className="desktop-sidebar" />
        
        {/* Mobile Drawer */}
        <Drawer
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Menu</span>
              <Button 
                type="text" 
                icon={<CloseOutlined />} 
                onClick={toggleMobileMenu} 
                size="small"
              />
            </div>
          }
          placement="left"
          onClose={toggleMobileMenu}
          open={mobileMenuVisible}
          className="mobile-menu-drawer"
          width={250}
          closable={false}
          maskClosable={true}
        >
          <Sidebar mode="vertical" onClose={toggleMobileMenu} />
        </Drawer>
        
        <Content className="layout-content">
          {children}
        </Content>
      </AntdLayout>
    </AntdLayout>
  );
});

export default Layout;
