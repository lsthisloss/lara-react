import { Card, Row, Col, Statistic, Button, Table, Space, Typography, Modal } from 'antd';
import { observer } from 'mobx-react-lite';
import { 
  UserOutlined, 
  FileTextOutlined, 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useUserStore, usePostStore } from '../hooks/useStore';
import PostModal from '../components/PostModal';
import { logger } from '../utils/logger';
import type { Post } from '../types/interfaces';
import '../styles/_dashboard.scss';

const { Title } = Typography;
const { confirm } = Modal;

const Dashboard = observer(() => {
  const userStore = useUserStore();
  const postStore = usePostStore();
  const [loading, setLoading] = useState(false);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      await postStore.loadPosts();
      logger.log('Dashboard: posts loaded successfully');
    } catch (error) {
      logger.error('Dashboard: failed to load posts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setIsPostModalVisible(true);
    logger.log('Dashboard: create post modal opened');
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsPostModalVisible(true);
    logger.log('Dashboard: edit post modal opened', { postId: post.id });
  };

  const handleDeletePost = async (post: Post) => {
    confirm({
      title: 'Delete Post',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${post.title}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await postStore.deletePost(post.id);
          logger.log('Dashboard: post deleted', { postId: post.id });
        } catch (error) {
          logger.error('Dashboard: failed to delete post', error);
        }
      },
    });
  };

  const handleModalCancel = () => {
    setIsPostModalVisible(false);
    setEditingPost(null);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string) => content.length > 100 ? `${content.slice(0, 100)}...` : content,
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      width: 150,
      render: (author: any) => author?.name || 'Unknown',
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Post) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditPost(record)}
            size="small"
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeletePost(record)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <Title level={2}>Dashboard</Title>
        <p>Welcome back, {userStore.user?.name}!</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="dashboard-stats">
        <Col xs={24} sm={12} lg={8}>
          <Card className="stats-card primary">
            <Statistic
              title="Total Posts"
              value={postStore.posts.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stats-card success">
            <Statistic
              title="Total Users"
              value={1}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <Card className="stats-card warning">
            <Statistic
              title="Posts Today"
              value={postStore.posts.filter(post => {
                const today = new Date().toDateString();
                const postDate = new Date(post.created_at).toDateString();
                return today === postDate;
              }).length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Posts Table */}
      <div className="dashboard-content">
        <Card className="posts-card">
          <div className="card-header">
            <h3>Recent Posts</h3>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreatePost}
              className="create-btn"
            >
              Create Post
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={postStore.posts}
            rowKey="id"
            loading={loading || postStore.loading}
            scroll={{ x: 600 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} posts`,
              responsive: true,
            }}
          />
        </Card>
      </div>

      {/* Post Modal */}
      <PostModal 
        visible={isPostModalVisible}
        onCancel={handleModalCancel}
        editingPost={editingPost}
      />
    </div>
  );
});

export default Dashboard;
