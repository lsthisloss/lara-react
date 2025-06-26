import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { 
  Button, 
  Modal, 
  Form, 
  Input, 
  Typography, 
  message, 
  Divider, 
  Progress,
  Alert,
  Space
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  LoginOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../hooks/useStore';
import { logger } from '../utils/logger';
import type { LoginFormValues, RegisterFormValues } from '../types/interfaces';

const { Title, Text } = Typography;

/**
 * Компонент страницы авторизации
 * Поддерживает переключение между входом и регистрацией через модальные окна
 */
const AuthPage = observer(() => {
  const userStore = useUserStore();
  const navigate = useNavigate();
  
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Если пользователь уже авторизован, перенаправляем на главную
  useEffect(() => {
    if (userStore.isAuthenticated) {
      logger.log('AuthPage: User already authenticated, redirecting to dashboard');
      navigate('/');
    }
  }, [userStore.isAuthenticated, navigate]);
  
  const handleAuthSuccess = () => {
    logger.log('AuthPage: Auth success, redirecting to dashboard');
    navigate('/');
    setShowLogin(false);
    setShowRegister(false);
  };
  
  // Функция для обработки входа
  const onLogin = async (values: LoginFormValues) => {
    logger.log('AuthPage: Login form submitted');
    
    try {
      const result = await userStore.login(values);
      
      if (result.success && result.user) {
        message.success('Login successful!');
        handleAuthSuccess();
      } else {
        message.error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Failed to login. Please try again.');
    }
  };
  
  // Функция для обработки регистрации
  const onRegister = async (values: RegisterFormValues) => {
    logger.log('AuthPage: Register form submitted');
    
    try {
      const result = await userStore.register(values);
      
      if (result.success && result.user) {
        message.success('Registration successful!');
        handleAuthSuccess();
      } else {
        message.error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      message.error('Failed to register. Please try again.');
    }
  };
  
  // Функция для оценки надежности пароля
  const evaluatePasswordStrength = (password: string) => {
    if (!password) return 0;
    
    let strength = 0;
    
    if (password.length >= 6) strength += 20;
    if (password.length >= 10) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[@$!%*?&#^(){}[\]<>,.;:+=\-_|\\/"'`~]/.test(password)) strength += 25;
    
    return Math.min(100, strength);
  };
  
  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 30) return '#ff4d4f';
    if (strength < 60) return '#faad14';
    if (strength < 80) return '#1890ff';
    return '#52c41a';
  };
  
  const getPasswordStrengthText = (strength: number) => {
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 80) return 'Good';
    return 'Strong';
  };
  
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-lock" role="img" aria-label="Lock icon">
          <LockOutlined style={{ fontSize: 64, color: '#1890ff' }} />
        </div>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Who Are You?
        </Title>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Button
            type="primary"
            icon={<LoginOutlined />}
            size="large"
            block
            onClick={() => setShowLogin(true)}
          >
            Login
          </Button>
          
          <Button
            icon={<UserAddOutlined />}
            size="large"
            block
            onClick={() => setShowRegister(true)}
          >
            Create account
          </Button>
        </Space>
      </div>

      {/* Modal for Login */}
      <Modal
        title="Login"
        open={showLogin}
        onCancel={() => setShowLogin(false)}
        footer={null}
        centered
      >
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onLogin}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Email" 
              size="large" 
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Password" 
              size="large" 
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block
              loading={userStore.loading}
            >
              Log in
            </Button>
          </Form.Item>
          
          <Divider plain>
            <Text type="secondary">Don't have an account?</Text>
          </Divider>
          
          <Button 
            block 
            onClick={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          >
            Register now
          </Button>
        </Form>
      </Modal>

      {/* Modal for Registration */}
      <Modal
        title="Registration"
        open={showRegister}
        onCancel={() => setShowRegister(false)}
        footer={null}
        centered
      >
        <Form
          name="register"
          onFinish={onRegister}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Name" 
              size="large" 
            />
          </Form.Item>
          
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Email" 
              size="large" 
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Password" 
              size="large"
              onChange={(e) => {
                const strength = evaluatePasswordStrength(e.target.value);
                setPasswordStrength(strength);
              }}
            />
          </Form.Item>
          
          {passwordStrength > 0 && (
            <Form.Item>
              <div style={{ marginBottom: 8 }}>
                <Text style={{ color: getPasswordStrengthColor(passwordStrength) }}>
                  Password Strength: {getPasswordStrengthText(passwordStrength)}
                </Text>
              </div>
              <Progress 
                percent={passwordStrength} 
                showInfo={false}
                strokeColor={getPasswordStrengthColor(passwordStrength)}
                size="small"
              />
            </Form.Item>
          )}
          
          <Form.Item
            name="password_confirmation"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Confirm Password" 
              size="large" 
            />
          </Form.Item>
          
          {passwordStrength < 30 && passwordStrength > 0 && (
            <Form.Item>
              <Alert
                message="Weak Password"
                description="Consider using a stronger password with uppercase letters, numbers and special characters."
                type="warning"
                showIcon
              />
            </Form.Item>
          )}
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              block
              loading={userStore.loading}
              disabled={passwordStrength < 30 && passwordStrength > 0}
            >
              Register
            </Button>
          </Form.Item>
          
          <Divider plain>
            <Text type="secondary">Already have an account?</Text>
          </Divider>
          
          <Button 
            block 
            onClick={() => {
              setShowRegister(false);
              setShowLogin(true);
            }}
          >
            Login instead
          </Button>
        </Form>
      </Modal>
    </div>
  );
});

export default AuthPage;
