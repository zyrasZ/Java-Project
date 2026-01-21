import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Input, Tag, Spin, Empty, message } from 'antd';
import { FolderOutlined, CalendarOutlined } from '@ant-design/icons';
import studentService from '../../services/studentService';

const { Search } = Input;

const MyProjects = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await studentService.getApprovedProjects();
      const projectsArray = Array.isArray(data) ? data : [];
      setProjects(projectsArray);
      setFilteredProjects(projectsArray);
    } catch (error) {
      console.error('Error fetching projects:', error);
      message.error('Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    if (!value) {
      setFilteredProjects(projects);
      return;
    }

    const filtered = projects.filter(project =>
      project.title.toLowerCase().includes(value.toLowerCase()) ||
      project.description?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProjects(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      case 'DRAFT': return 'default';
      default: return 'default';
    }
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#262626' }}>
          Dự án của tôi
        </h1>
        <p style={{ color: '#8c8c8c' }}>Xem tất cả dự án đã được phê duyệt</p>
      </div>

      <Search
        placeholder="Tìm kiếm dự án..."
        onSearch={handleSearch}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ marginBottom: '24px' }}
        size="large"
        allowClear
      />

      {filteredProjects.length === 0 ? (
        <Empty description="Không tìm thấy dự án nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredProjects.map((project) => (
            <Col xs={24} sm={12} lg={8} key={project.id}>
              <Link to={`/student/projects/${project.id}`}>
                <Card
                  hoverable
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FolderOutlined />
                      <span style={{ fontSize: '16px' }}>{project.title}</span>
                    </div>
                  }
                  extra={<Tag color={getStatusColor(project.status)}>{project.status}</Tag>}
                >
                  <p style={{ marginBottom: '16px', minHeight: '40px', color: '#666' }}>
                    {project.description || 'Không có mô tả'}
                  </p>
                  
                  {project.classRoom && (
                    <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                      <FolderOutlined style={{ marginRight: '8px' }} />
                      {project.classRoom.name} ({project.classRoom.code})
                    </div>
                  )}

                  {project.deadline && (
                    <div style={{ fontSize: '14px', color: isOverdue(project.deadline) ? '#cf1322' : '#666' }}>
                      <CalendarOutlined style={{ marginRight: '8px' }} />
                      Hạn: {new Date(project.deadline).toLocaleDateString('vi-VN')}
                      {isOverdue(project.deadline) && <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>(Quá hạn)</span>}
                    </div>
                  )}
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default MyProjects;
