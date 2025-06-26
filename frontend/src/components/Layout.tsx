import { Layout as AntdLayout, Menu, Button, Avatar, Dropdown, Space, Typography, Drawer } from 'antd';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  DashboardOutlined,
  FileTextOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../hooks/useStore';
import { logger } from '../utils/logger';
import type { MenuProps } from 'antd';

const { Header, Content, Sider } = AntdLayout;
const { Title } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = observer(({ children }: LayoutProps) => {
  const userStore = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const handleLogout = async () => {
    logger.log('Layout: logout requested');
    const result = await userStore.logout();
    
    if (result.success) {
      navigate('/auth');
    }
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

  const sidebarMenuItems: MenuProps['items'] = [
    {
      key: '/posts',
      icon: <FileTextOutlined />,
      label: 'Posts',
      onClick: () => navigate('/posts')
    },
    ...(userStore.isAdmin ? [{
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard')
    }] : [])
  ];

  return (
    <AntdLayout className="app-layout">
      <Header className="layout-header">
        <div className="header-left">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuVisible(true)}
            className="mobile-menu-trigger"
          />
          <Title level={4} className="logo">
            Hello World!
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
        <Sider width={240} className="layout-sider">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={sidebarMenuItems}
          />
        </Sider>

        {/* Mobile Drawer */}
        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          className="mobile-menu-drawer"
          width={250}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={sidebarMenuItems}
            onClick={() => setMobileMenuVisible(false)}
          />
        </Drawer>
        
        <Content className="layout-content">
          {children}
        </Content>
      </AntdLayout>
    </AntdLayout>
  );
});

export default Layout;
