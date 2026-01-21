import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, Typography, Button, Space } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { user, logout } = useAuth();

  // Redirect dựa trên role
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'ADMIN':
          window.location.href = '/admin';
          break;
        case 'STAFF':
          window.location.href = '/staff';
          break;
        case 'LECTURER':
          window.location.href = '/lecturer';
          break;
        case 'STUDENT':
          window.location.href = '/student';
          break;
        case 'HEAD_DEPARTMENT':
          // window.location.href = '/head-department';
          break;
        default:
          break;
      }
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <UserOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
          
          <div>
            <Title level={2}>Chào mừng đến với CollabSphere!</Title>
            <Text type="secondary">
              Xin chào, {user.fullName || user.email}
            </Text>
          </div>

          <div>
            <Text strong>Vai trò: </Text>
            <Text>{user.role}</Text>
          </div>

          <Button 
            type="primary" 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            size="large"
          >
            Đăng xuất
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Dashboard;