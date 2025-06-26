import { Card, Row, Col, Statistic, Button, Table, Space, Typography, App, Alert, Modal, Form, Input } from 'antd';
import { observer } from 'mobx-react-lite';
import { 
  UserOutlined, 
  FileTextOutlined, 
  TeamOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  EditOutlined, 
  DeleteOutlined
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useUserStore, useDashboardStore, usePostStore } from '../hooks/useStore';
import { logger } from '../utils/logger';
import type { DashboardUser } from '../services/dashboardService';
import '../styles/_dashboard.scss';

const { Title } = Typography;

/*
  * Dashboard - Административная панель
  * Позволяет администраторам управлять пользователями и постами
  * Использует MobX для управления состоянием дашборда, пользователей и постов
  */
const Dashboard = observer(() => {
  const userStore = useUserStore();
  const dashboardStore = useDashboardStore();
  const postStore = usePostStore();
  const { modal, message } = App.useApp();
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editForm] = Form.useForm();

  useEffect(() => {
    // Проверяем права доступа
    if (!userStore.isAdmin) {
      logger.warn('Dashboard: non-admin user attempted to access dashboard');
      message.error('Access denied. Admin rights required.');
      return;
    }

    // Загружаем данные дашборда и пользователей
    loadInitialData();
  }, [userStore.isAdmin]);

  const loadInitialData = async () => {
    try {
      // Загружаем данные дашборда и пользователей параллельно
      await Promise.all([
        dashboardStore.loadDashboardData(),
        dashboardStore.loadUsers()
      ]);
      logger.log('Dashboard: initial data loaded successfully');
    } catch (error) {
      logger.error('Dashboard: failed to load initial data', error);
      message.error('Failed to load dashboard data');
    }
  };

  const loadUsers = async () => {
    try {
      await dashboardStore.loadUsers();
      logger.log('Dashboard: users loaded successfully');
    } catch (error) {
      logger.error('Dashboard: failed to load users', error);
      message.error('Failed to load users');
    }
  };

  const handleToggleAdmin = (user: DashboardUser) => {
    modal.confirm({
      title: 'Confirm Action',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to ${user.is_admin ? 'remove' : 'grant'} admin rights ${user.is_admin ? 'from' : 'to'} ${user.name}?`,
      onOk: async () => {
        try {
          await dashboardStore.toggleUserAdmin(user.id);
          message.success(`Admin rights ${user.is_admin ? 'removed from' : 'granted to'} ${user.name}`);
          // Reload users list
          await loadUsers();
        } catch (error) {
          logger.error('Dashboard: failed to toggle admin status', error);
          message.error('Failed to update admin status');
        }
      },
    });
  };

  const handleDeletePost = (post: any) => {
    modal.confirm({
      title: 'Delete Post',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${post.title}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          logger.log('Dashboard: attempting to delete post', { postId: post.id, title: post.title });
          await postStore.deletePost(post.id);
          message.success('Post deleted successfully');
          logger.log('Dashboard: post deleted successfully', { postId: post.id });
          // Reload only dashboard data to update recent posts, not all data
          await dashboardStore.loadDashboardData();
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Failed to delete post';
          message.error(errorMessage);
          logger.error('Dashboard: failed to delete post', { 
            postId: post.id, 
            error: errorMessage, 
            fullError: error 
          });
        }
      },
    });
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    editForm.setFieldsValue({
      title: post.title,
      content: post.content
    });
  };

  const handleSavePost = async (values: { title: string; content: string }) => {
    if (!editingPost) return;
    
    try {
      await postStore.updatePost(editingPost.id, values);
      message.success('Post updated successfully');
      logger.log('Dashboard: post updated successfully', { postId: editingPost.id });
      setEditingPost(null);
      editForm.resetFields();
      // Reload only dashboard data to update recent posts, not all data
      await dashboardStore.loadDashboardData();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update post';
      message.error(errorMessage);
      logger.error('Dashboard: failed to update post', { 
        postId: editingPost.id, 
        error: errorMessage, 
        fullError: error 
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    editForm.resetFields();
  };

  // Проверка прав доступа
  if (!userStore.isAdmin) {
    return (
      <Alert
        message="Access Denied"
        description="You don't have permission to access this page. Admin rights required."
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  const { dashboardData, users, loading, error } = dashboardStore;

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" danger onClick={loadInitialData}>
            Retry
          </Button>
        }
        style={{ margin: '20px' }}
      />
    );
  }

  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Posts Count',
      dataIndex: 'posts_count',
      key: 'posts_count',
      width: 100,
      render: (count: number) => count || 0,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Admin',
      dataIndex: 'is_admin',
      key: 'is_admin',
      width: 80,
      render: (isAdmin: boolean) => (
        <span style={{ color: isAdmin ? '#52c41a' : '#8c8c8c' }}>
          {isAdmin ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: DashboardUser) => (
        <Space>
          <Button
            size="small"
            type={record.is_admin ? 'default' : 'primary'}
            onClick={() => handleToggleAdmin(record)}
            disabled={record.id === userStore.user?.id} // Can't remove own admin rights
          >
            {record.is_admin ? 'Remove Admin' : 'Make Admin'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="dashboard">
      <Title level={2}>Admin Dashboard</Title>
      
      {/* Statistics Cards */}
      {dashboardData && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Users"
                value={dashboardData.stats.total_users}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Posts"
                value={dashboardData.stats.total_posts}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Admins"
                value={dashboardData.stats.total_admins}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Recent Users */}
      {dashboardData?.recent_users && (
        <Card 
          title="Recent Users" 
          style={{ marginBottom: 24 }}
        >
          <Table
            dataSource={dashboardData.recent_users}
            columns={userColumns.slice(0, -1)} // Remove actions column for recent users
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}

      {/* Recent Posts */}
      {dashboardData?.recent_posts && (
        <Card title="Recent Posts" style={{ marginBottom: 24 }}>
          <Table
            dataSource={dashboardData.recent_posts}
            columns={[
              {
                title: 'Title',
                dataIndex: 'title',
                key: 'title',
                ellipsis: true,
              },
              {
                title: 'Author',
                key: 'author',
                width: 120,
                render: (_, record) => record.user?.name || 'Unknown',
              },
              {
                title: 'Created',
                dataIndex: 'created_at',
                key: 'created_at',
                width: 100,
                render: (date: string) => new Date(date).toLocaleDateString(),
                responsive: ['md'],
              },
              {
                title: 'Actions',
                key: 'actions',
                width: 120,
                render: (_, record) => (
                  <Space size="small">
                    <Button 
                      size="small" 
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => handleEditPost(record)}
                    />
                    <Button 
                      size="small" 
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeletePost(record)}
                    />
                  </Space>
                ),
              },
            ]}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}

      {/* All Users Management */}
      <Card 
        title="User Management"
        extra={
          <Button 
            icon={<ReloadOutlined />}
            onClick={loadUsers}
            loading={loading}
            size="small"
          >
            Refresh
          </Button>
        }
      >
        <Table
          dataSource={users}
          columns={[
            {
              title: 'ID',
              dataIndex: 'id',
              key: 'id',
              width: 60,
              responsive: ['lg'],
            },
            {
              title: 'Name',
              dataIndex: 'name',
              key: 'name',
              ellipsis: true,
            },
            {
              title: 'Email',
              dataIndex: 'email',
              key: 'email',
              ellipsis: true,
              responsive: ['md'],
            },
            {
              title: 'Posts',
              dataIndex: 'posts_count',
              key: 'posts_count',
              width: 80,
              render: (count: number) => count || 0,
              responsive: ['lg'],
            },
            {
              title: 'Admin',
              dataIndex: 'is_admin',
              key: 'is_admin',
              width: 80,
              render: (isAdmin: boolean) => (
                <span style={{ color: isAdmin ? '#52c41a' : '#8c8c8c' }}>
                  {isAdmin ? '✓' : '✗'}
                </span>
              ),
            },
            {
              title: 'Actions',
              key: 'actions',
              width: 120,
              render: (_: any, record: DashboardUser) => (
                <Button
                  size="small"
                  type={record.is_admin ? 'default' : 'primary'}
                  onClick={() => handleToggleAdmin(record)}
                  disabled={record.id === userStore.user?.id}
                  style={{ fontSize: '12px' }}
                >
                  {record.is_admin ? 'Remove' : 'Grant'}
                </Button>
              ),
            },
          ]}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            responsive: true,
          }}
        />
      </Card>

      {/* Edit Post Modal */}
      <Modal
        title="Edit Post"
        open={!!editingPost}
        onCancel={handleCancelEdit}
        footer={null}
        width="90%"
        style={{ maxWidth: 600 }}
        centered
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleSavePost}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter post title' }]}
          >
            <Input placeholder="Enter post title" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please enter post content' }]}
          >
            <Input.TextArea 
              placeholder="Enter post content" 
              rows={6}
              autoSize={{ minRows: 4, maxRows: 8 }}
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

export default Dashboard;
