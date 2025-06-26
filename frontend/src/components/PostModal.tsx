import { Modal, Form, Input, Button, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { usePostStore } from '../hooks/useStore';
import { logger } from '../utils/logger';

const { TextArea } = Input;

interface PostModalProps {
  visible: boolean;
  onCancel: () => void;
  editingPost?: any | null;
}

const PostModal = observer(({ visible, onCancel, editingPost }: PostModalProps) => {
  const postStore = usePostStore();
  const [form] = Form.useForm();

  const handleSubmit = async (values: { title: string; content: string }) => {
    try {
      if (editingPost) {
        await postStore.updatePost(editingPost.id, values);
        message.success('Post updated successfully!');
      } else {
        await postStore.createPost(values);
        message.success('Post created successfully!');
      }
      
      form.resetFields();
      onCancel();
    } catch (error) {
      logger.error('PostModal: Failed to save post', error);
      message.error('Failed to save post');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };
  
  // При изменении видимости модального окна или редактируемого поста
  // сбрасываем и устанавливаем значения формы
  useEffect(() => {
    // Только если модальное окно открыто
    if (visible) {
      // Сначала сбрасываем форму
      form.resetFields();
      
      // Если есть редактируемый пост, заполняем форму его данными
      if (editingPost) {
        console.log('Setting form values from editingPost:', editingPost);
        
        // Небольшая задержка для гарантии, что форма инициализирована
        setTimeout(() => {
          form.setFieldsValue({
            title: editingPost.title || '',
            content: editingPost.content || ''
          });
        }, 100);
      } else {
        console.log('No editingPost provided, form was reset');
      }
    }
  }, [visible, editingPost, form]);

  return (
    <Modal
      title={editingPost ? 'Edit Post' : 'Create New Post'}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width="90%"
      style={{ maxWidth: 600 }}
      centered
      destroyOnClose={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        preserve={false}
        validateTrigger={['onChange', 'onBlur']}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, message: 'Please enter post title' },
            { min: 3, message: 'Title must be at least 3 characters' }
          ]}
        >
          <Input placeholder="Enter post title..." />
        </Form.Item>

        <Form.Item
          name="content"
          label="Content"
          rules={[
            { required: true, message: 'Please enter post content' },
            { min: 10, message: 'Content must be at least 10 characters' }
          ]}
        >
          <TextArea 
            rows={6}
            autoSize={{ minRows: 4, maxRows: 8 }}
            placeholder="Write your post content here..." 
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={postStore.loading}
            >
              {editingPost ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default PostModal;
