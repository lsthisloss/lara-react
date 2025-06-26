import { Card, Button, Form, Typography, message, Input, Divider } from 'antd';
import { observer } from 'mobx-react-lite';
import { LockOutlined, UserOutlined, EditOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useUserStore } from '../hooks/useStore';
import { logger } from '../utils/logger';
import '../styles/_settings.scss';

const { Title } = Typography;

/*
  * SettingsPage - Страница настроек аккаунта
  * Позволяет пользователю обновлять профиль и менять пароль
  * Использует MobX для управления состоянием пользователя
  */
const SettingsPage = observer(() => {
  const userStore = useUserStore();
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  
  // Инициализируем форму профиля данными пользователя
  useEffect(() => {
    if (userStore.user) {
      profileForm.setFieldsValue({
        name: userStore.user.name,
        email: userStore.user.email,
      });
    }
  }, [userStore.user, profileForm]);

  const handleUpdateProfile = async (values: any) => {
    setProfileLoading(true);
    try {
      const { success, message: errorMessage } = await userStore.updateProfile({
        name: values.name,
        email: values.email
      });
      
      if (success) {
        message.success('Profile updated successfully');
      } else {
        message.error(errorMessage || 'Failed to update profile');
      }
    } catch (error) {
      logger.error('Settings: failed to update profile', error);
      message.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    setPasswordLoading(true);
    try {
      const { success, message: errorMessage } = await userStore.changePassword({
        current_password: values.currentPassword,
        password: values.newPassword,
        password_confirmation: values.confirmPassword
      });
      
      if (success) {
        message.success('Password changed successfully');
        passwordForm.resetFields();
      } else {
        message.error(errorMessage || 'Failed to change password');
      }
    } catch (error) {
      logger.error('Settings: failed to change password', error);
      message.error('Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <Title level={2}>Account Settings</Title>
        <p>Manage your account information and security</p>
      </div>

      <div className="settings-content">
        {/* Profile Update Section */}
        <Card className="settings-card profile-card">
          <div className="card-header">
            <UserOutlined />
            <h3>Profile Information</h3>
          </div>
          
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleUpdateProfile}
          >
            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input placeholder="Enter your full name" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={profileLoading}
                icon={<EditOutlined />}
                size="large"
              >
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </Card>
        
        <Divider />

        {/* Password Change Section */}
        <Card className="settings-card password-card">
          <div className="card-header">
            <LockOutlined />
            <h3>Change Password</h3>
          </div>
          
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleChangePassword}
          >
            <Form.Item
              label="Current Password"
              name="currentPassword"
              rules={[{ required: true, message: 'Please enter your current password' }]}
            >
              <Input.Password placeholder="Enter your current password" />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: 'Please enter your new password' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
            >
              <Input.Password placeholder="Enter your new password" />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm your new password" />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={passwordLoading}
                icon={<LockOutlined />}
                size="large"
              >
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
});

export default SettingsPage;
