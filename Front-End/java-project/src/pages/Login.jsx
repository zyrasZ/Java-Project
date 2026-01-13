import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import './Login.css';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Redirect nếu đã đăng nhập
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await login(values);
      if (result.success) {
        message.success('Đăng nhập thành công!');
        // Navigation sẽ được xử lý bởi useEffect trong AuthContext
      } else {
        message.error(result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay">
          <Card className="login-card" bordered={false}>
            <div className="login-header">
              <div className="login-logo">
                <LoginOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
              </div>
              <Title level={2} className="login-title">
                CollabSphere
              </Title>
              <Text className="login-subtitle">
                Hệ thống quản lý dự án sinh viên
              </Text>
            </div>

            <Form
              name="login"
              className="login-form"
              onFinish={onFinish}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập email!',
                  },
                  {
                    type: 'email',
                    message: 'Email không hợp lệ!',
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Email"
                  className="login-input"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập mật khẩu!',
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu"
                  className="login-input"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-button"
                  loading={loading}
                  block
                >
                  {loading ? <Spin size="small" /> : 'Đăng nhập'}
                </Button>
              </Form.Item>
            </Form>

            <div className="login-footer">
              <Text type="secondary">
                Quên mật khẩu? Liên hệ quản trị viên
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;