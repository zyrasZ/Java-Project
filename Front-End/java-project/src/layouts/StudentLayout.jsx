import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Drawer } from 'antd';
import {
  HomeOutlined,
  FolderOutlined,
  TeamOutlined,
  FileTextOutlined,
  MessageOutlined,
  EditOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/student/dashboard',
      icon: <HomeOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/student/dashboard')
    },
    {
      key: '/student/projects',
      icon: <FolderOutlined />,
      label: 'My Projects',
      onClick: () => navigate('/student/projects')
    },
    {
      key: '/student/teams',
      icon: <TeamOutlined />,
      label: 'My Teams',
      onClick: () => navigate('/student/teams')
    },
    {
      key: '/student/tasks',
      icon: <FileTextOutlined />,
      label: 'My Tasks',
      onClick: () => navigate('/student/tasks')
    },
    {
      key: '/student/chat',
      icon: <MessageOutlined />,
      label: 'Team Chat',
      onClick: () => navigate('/student/chat')
    },
    {
      key: '/student/whiteboard',
      icon: <EditOutlined />,
      label: 'Whiteboard',
      onClick: () => navigate('/student/whiteboard')
    },
    {
      key: '/student/grades',
      icon: <BarChartOutlined />,
      label: 'My Grades',
      onClick: () => navigate('/student/grades')
    }
  ];

  const sidebarContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <h2 style={{ margin: 0, color: '#1890ff', fontSize: '20px', fontWeight: 'bold' }}>
          CollabSphere
        </h2>
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{ flex: 1, borderRight: 0 }}
      />

      <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <Avatar icon={<UserOutlined />} size={40} />
          <div style={{ marginLeft: '12px', flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: '14px' }}>{user?.fullName}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>{user?.email}</div>
          </div>
        </div>
        <Button
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          block
        >
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <Sider
        width={256}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: '#fff',
          borderRight: '1px solid #f0f0f0'
        }}
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          // Handle responsive behavior
        }}
        trigger={null}
        className="desktop-sider"
      >
        {sidebarContent}
      </Sider>

      <Layout style={{ marginLeft: 256 }}>
        {/* Mobile Header */}
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: 'none',
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}
          className="mobile-header"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
            />
            <h2 style={{ margin: 0, color: '#1890ff', fontSize: '18px', fontWeight: 'bold' }}>
              CollabSphere
            </h2>
            <div style={{ width: 32 }} />
          </div>
        </Header>

        {/* Mobile Drawer */}
        <Drawer
          placement="left"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          bodyStyle={{ padding: 0 }}
          width={256}
        >
          {sidebarContent}
        </Drawer>

        {/* Main Content */}
        <Content style={{ background: '#f0f2f5' }}>
          <Outlet />
        </Content>
      </Layout>

      <style>{`
        @media (max-width: 992px) {
          .desktop-sider {
            display: none !important;
          }
          .mobile-header {
            display: flex !important;
          }
          .ant-layout {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default StudentLayout;
