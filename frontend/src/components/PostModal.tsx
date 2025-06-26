import { Modal, Form, Input, Button, message } from 'antd';
import { observer } from 'mobx-react-lite';
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

  return (
    <Modal
      title={editingPost ? 'Edit Post' : 'Create New Post'}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={editingPost ? {
          title: editingPost.title,
          content: editingPost.content
        } : {}}
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
            placeholder="Write your post content here..." 
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit"
            loading={postStore.loading}
          >
            {editingPost ? 'Update Post' : 'Create Post'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default PostModal;
