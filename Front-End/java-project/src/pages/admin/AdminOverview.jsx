import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, Alert } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  ProjectOutlined, 
  BookOutlined,
  TrophyOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';

const { Title } = Typography;

const AdminOverview = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUserStatistics();
      if (response.status === 'success') {
        setStatistics(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Không thể tải thống kê');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Đang tải thống kê...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        style={{ marginBottom: '24px' }}
      />
    );
  }

  return (
    <div>
      <Title level={2}>Tổng quan hệ thống</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tổng số người dùng"
              value={statistics?.total || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Người dùng hoạt động"
              value={statistics?.byStatus?.active || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Giảng viên"
              value={statistics?.byRole?.LECTURER || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Sinh viên"
              value={statistics?.byRole?.STUDENT || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Quản trị viên"
              value={statistics?.byRole?.ADMIN || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Nhân viên"
              value={statistics?.byRole?.STAFF || 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Trưởng khoa"
              value={statistics?.byRole?.HEAD_DEPARTMENT || 0}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Người dùng bị khóa"
              value={statistics?.byStatus?.inactive || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Thống kê chi tiết" style={{ textAlign: 'center' }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Tỷ lệ người dùng hoạt động"
                  value={statistics?.total > 0 ? 
                    Math.round((statistics.byStatus.active / statistics.total) * 100) : 0
                  }
                  suffix="%"
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Tỷ lệ sinh viên"
                  value={statistics?.total > 0 ? 
                    Math.round(((statistics.byRole.STUDENT || 0) / statistics.total) * 100) : 0
                  }
                  suffix="%"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Tỷ lệ giảng viên"
                  value={statistics?.total > 0 ? 
                    Math.round(((statistics.byRole.LECTURER || 0) / statistics.total) * 100) : 0
                  }
                  suffix="%"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminOverview;