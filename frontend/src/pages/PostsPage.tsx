import { Button, Avatar, Typography, List, App, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { usePostStore, useUserStore } from '../hooks/useStore';
import PostModal from '../components/PostModal';
import { logger } from '../utils/logger';
import type { Post } from '../types/interfaces';
import '../styles/_posts.scss';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

/*
  * PostsPage - Страница со списком постов
  * Позволяет создавать, редактировать и удалять посты
  * Использует MobX для управления состоянием постов и пользователя
  */
const PostsPage = observer(() => {
  const postStore = usePostStore();
  const userStore = useUserStore();
  const navigate = useNavigate();
  const { modal } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadPosts();
  }, [currentPage]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      await postStore.loadPosts(currentPage);
      logger.log('Posts: posts loaded successfully');
    } catch (error) {
      logger.error('Posts: failed to load posts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setIsPostModalVisible(true);
    logger.log('Posts: create post modal opened');
  };
  
  const handleEditPost = (post: Post) => {
    // Проверка: только автор может редактировать свой пост
    const authorId = post.user_id || post.author?.id;
    if (userStore.user?.id !== authorId) {
      message.error('You can only edit your own posts');
      return;
    }
    
    // Создаем глубокую копию поста для редактирования
    console.log('Opening edit modal for post:', post);
    setEditingPost({
      id: post.id,
      title: post.title || '',
      content: post.content || '',
      user_id: post.user_id || post.author?.id,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author: post.author ? { ...post.author } : undefined
    });
    
    // Короткая задержка для установки данных перед открытием модального окна
    setTimeout(() => {
      setIsPostModalVisible(true);
      logger.log('Posts: edit post modal opened', { postId: post.id });
    }, 50);
  };
  
  const handleDeletePost = (post: Post) => {
    // Проверка: только автор может удалить свой пост
    const authorId = post.user_id || post.author?.id;
    if (userStore.user?.id !== authorId) {
      message.error('You can only delete your own posts');
      return;
    }
    
    modal.confirm({
      title: 'Delete Post',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete "${post.title}"?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setLoading(true);
        try {
          console.log('PostsPage - Attempting to delete post with ID:', post.id);
          
          try {
            // Store post count before deletion for verification
            const postsCountBefore = postStore.posts.length;
            console.log('Posts count before deletion:', postsCountBefore);
            
            const result = await postStore.deletePost(post.id);
            console.log('PostsPage - Delete result:', result);
            
            // Check if posts were actually removed from the store
            const postsCountAfter = postStore.posts.length;
            console.log('Posts count after deletion:', postsCountAfter);
            
            if (result) {
              // No need to reload all posts - MobX will update the UI automatically
              // because the postStore.posts array has been modified directly in the store
              message.success(`Post "${post.title}" deleted successfully`);
              
              // If current page might become empty after deletion, adjust the page
              const pageSize = postStore.perPage;
              if (postsCountAfter === 0 || 
                 (currentPage > 1 && postsCountAfter <= (currentPage - 1) * pageSize)) {
                const newPage = Math.max(1, currentPage - 1);
                setCurrentPage(newPage);
              }
            } else {
              message.error('Failed to delete post. Please try again.');
            }
            logger.log('Posts: post deleted', { 
              postId: post.id, 
              postsCountBefore,
              postsCountAfter
            });
          } catch (deleteError: any) {
            console.error('PostsPage - Delete post detailed error:', {
              status: deleteError.response?.status,
              data: deleteError.response?.data,
              message: deleteError.message,
              stack: deleteError.stack
            });
            message.error(`Error deleting post: ${deleteError.response?.data?.message || deleteError.message}`);
          }
        } catch (error) {
          console.error('PostsPage - Generic error during delete:', error);
          logger.error('Posts: failed to delete post', error);
          message.error('Failed to delete post');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleModalCancel = () => {
    setIsPostModalVisible(false);
    setEditingPost(null);
  };
  
  // Функция проверки прав на редактирование
  const canEditPost = (post: Post) => {
    // Получаем ID автора из разных возможных источников
    const postAuthorId = post.user_id || post.author?.id;
    const currentUserId = userStore.user?.id;
    
    // Проверка прав
    const canEdit = currentUserId === postAuthorId;
    
    console.log('Can edit post check:', {
      postId: post.id,
      postUserId: post.user_id,
      postAuthorId: post.author?.id,
      currentUserId: currentUserId,
      canEdit: canEdit
    });
    
    return canEdit;
  };
  
  // Функция для перехода на страницу профиля автора
  const goToAuthorProfile = (authorId?: number) => {
    if (!authorId) {
      console.error('Cannot navigate to author profile - ID is missing');
      message.error('Cannot view author profile');
      return;
    }
    
    console.log('Navigating to author profile:', authorId);
    navigate(`/profile/${authorId}`);
  };

  // Static color palette for avatar backgrounds
  const avatarColors = [
    '#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#13c2c2', '#52c41a', '#eb2f96', '#faad14', '#1890ff', '#b37feb',
    '#ff7875', '#36cfc9', '#ffc53d', '#73d13d', '#597ef7', '#ff85c0', '#ffd666', '#5cdbd3', '#bae637', '#adc6ff',
    '#ff9c6e', '#d3adf7', '#ffec3d', '#87e8de', '#95de64', '#91d5ff'
  ];

  // Get color by first letter
  const getAvatarColor = (name: string) => {
    if (!name || typeof name !== 'string') return avatarColors[0];
    const letter = name.trim().charAt(0).toUpperCase();
    const code = letter.charCodeAt(0);
    // A-Z: 65-90, map to 0-25
    if (code >= 65 && code <= 90) {
      return avatarColors[(code - 65) % avatarColors.length];
    }
    // fallback for non-latin
    return avatarColors[avatarColors.length - 1];
  };

  // Format date in a nice way
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="posts-page">
      <div className="posts-header">
        <div className="header-content">
          <Title level={2}>Posts</Title>
          <p>Share your thoughts and connect with others</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleCreatePost}
          size="large"
          className="create-post-btn"
        >
          Create Post
        </Button>
      </div>

      <div className="posts-content">
        <List
          itemLayout="vertical"
          size="large"
          pagination={{
            current: currentPage,
            total: postStore.totalPosts,
            pageSize: postStore.perPage,
            onChange: setCurrentPage,
            showSizeChanger: false,
            showQuickJumper: window.innerWidth > 768,
            showTotal: (total, range) =>
              window.innerWidth > 576 
                ? `${range[0]}-${range[1]} of ${total} posts`
                : `${total} posts`,
            responsive: true,
            hideOnSinglePage: false,
          }}
          dataSource={postStore.posts}
          loading={loading || postStore.loading}
          renderItem={(post) => {
            const authorName = post.author?.name || 'Unknown';
            const avatarBg = getAvatarColor(authorName);
            return (
              <List.Item
                key={post.id}
                className="post-item"
              >
                <div className="item-layout">
                  <Avatar
                    style={{ backgroundColor: avatarBg }}
                    size={40}
                  >
                    {authorName.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  <div className="item-content">
                    <div className="item-user-info">
                      <div>
                        <span 
                          className="clickable-username" 
                          style={{ fontWeight: 600 }}
                          onClick={() => goToAuthorProfile(post.author?.id || post.user_id)}
                        >
                          {authorName}
                        </span>
                        <span className="item-separator"> · </span>
                        <span className="item-date">{formatDate(post.created_at)}</span>
                      </div>
                      
                      {canEditPost(post) && (
                        <div className="post-actions">
                          <Button 
                            type="text" 
                            icon={<EditOutlined />} 
                            onClick={() => handleEditPost(post)}
                            size="small"
                            title="Edit post"
                          />
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePost(post);
                            }}
                            size="small"
                            title="Delete post"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="item-text">
                      <h4 style={{ margin: '8px 0 4px', fontSize: '16px', fontWeight: 600 }}>{post.title}</h4>
                      <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'Show more' }}>
                        {post.content}
                      </Paragraph>
                    </div>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />

        {postStore.posts.length === 0 && !loading && (
          <div className="empty-state">
            <Title level={4}>No posts yet</Title>
            <p>Be the first to create a post!</p>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreatePost}
              size="large"
            >
              Create First Post
            </Button>
          </div>
        )}
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

export default PostsPage;
