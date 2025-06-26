import { Menu, Layout } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FileTextOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { useUserStore } from '../hooks/useStore';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

interface SidebarProps {
  collapsed?: boolean;
  onClose?: () => void;
  mode?: 'inline' | 'vertical';
  className?: string;
}

const Sidebar = observer(({ collapsed = false, onClose, mode = 'inline', className = '' }: SidebarProps) => {
  const userStore = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (onClose) {
      onClose(); // Close mobile drawer if callback provided
    }
  };

  const sidebarMenuItems: MenuProps['items'] = [
    {
      key: '/posts',
      icon: <FileTextOutlined />,
      label: 'Posts',
      onClick: () => handleMenuClick('/posts')
    },
    ...(userStore.isAdmin ? [{
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => handleMenuClick('/dashboard')
    }] : [])
  ];

  return (
    <Sider 
      width={240} 
      className={`layout-sider ${className}`}
      collapsed={collapsed}
    >
      <Menu
        mode={mode}
        selectedKeys={[location.pathname]}
        items={sidebarMenuItems}
      />
    </Sider>
  );
});

export default Sidebar;
