import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Typography, Button, App } from 'antd';
import { 
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const StaffLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/staff/import/users',
      icon: <UserOutlined />,
      label: 'Import người dùng',
    },
    {
      key: '/staff/import/classrooms',
      icon: <TeamOutlined />,
      label: 'Import lớp học',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: logout,
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <App>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          theme="light"
          width={250}
          style={{
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ 
            padding: collapsed ? '16px 8px' : '16px 24px', 
            textAlign: 'center',
            borderBottom: '1px solid #f0f0f0'
          }}>
            {!collapsed ? (
              <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                CollabSphere Staff
              </Text>
            ) : (
              <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                CS
              </Text>
            )}
          </div>
          
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ border: 'none' }}
          />
        </Sider>
        
        <Layout>
          <Header style={{ 
            background: '#fff', 
            padding: '0 24px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 1
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
              <Text strong style={{ fontSize: '20px', marginLeft: '16px' }}>
                Import dữ liệu
              </Text>
            </div>
            
            <Dropdown 
              menu={{ items: userMenuItems }} 
              placement="bottomRight"
              trigger={['click']}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'background-color 0.3s'
              }}>
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ marginRight: '8px', backgroundColor: '#52c41a' }} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Text strong>{user?.fullName || user?.email}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {user?.role}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </Header>
          
          <Content style={{ 
            margin: '24px', 
            padding: '24px', 
            background: '#fff', 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            overflow: 'auto'
          }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </App>
  );
};

export default StaffLayout;