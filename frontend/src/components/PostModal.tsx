import { Form, Input, Button, message, Alert } from 'antd';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { usePostStore } from '../hooks/useStore';
import { logger } from '../utils/logger';
import CustomModal from './CustomModal';

const { TextArea } = Input;

interface PostModalProps {
  visible: boolean;
  onCancel: () => void;
  editingPost?: any | null;
}

const PostModal = observer(({ visible, onCancel, editingPost }: PostModalProps) => {
  const postStore = usePostStore();
  const [form] = Form.useForm();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: { title: string; content: string }) => {
    // Clear any previous errors
    setErrorMessage(null);
    
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
    } catch (error: any) {
      logger.error('PostModal: Failed to save post', error);
      
      // Handle different types of errors
      const errorMsg = error?.response?.data?.message || 
                      error?.message || 
                      'Failed to save post. Please try again.';
                      
      setErrorMessage(errorMsg);
      message.error(errorMsg);
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
    <CustomModal
      title={editingPost ? 'Edit Post' : 'Create New Post'}
      isOpen={visible}
      onClose={handleCancel}
      width="600px"
      className="post-modal"
      footer={
        <div className="post-modal-actions">
          <Button onClick={handleCancel} size="large">
            Cancel
          </Button>
          <Button 
            type="primary" 
            onClick={() => form.submit()}
            loading={postStore.loading}
            size="large"
          >
            {editingPost ? 'Update Post' : 'Create Post'}
          </Button>
        </div>
      }
    >
      {errorMessage && (
        <Alert
          message="Error"
          description={errorMessage}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          onClose={() => setErrorMessage(null)}
        />
      )}
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

        {/* Form footer is now handled by the CustomModal footer prop */}
      </Form>
    </CustomModal>
  );
});

export default PostModal;
