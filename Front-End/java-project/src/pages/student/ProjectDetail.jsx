import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Tag, Spin, List, Button, message } from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  TeamOutlined,
  FlagOutlined
} from '@ant-design/icons';
import studentService from '../../services/studentService';

const ProjectDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching project details for ID:', id);
      
      const [projectData, milestonesData, teamsData] = await Promise.all([
        studentService.getProjectById(id),
        studentService.getProjectMilestones(id),
        studentService.getTeamsByProject(id)
      ]);

      console.log('Project data received:', projectData);
      console.log('Milestones data received:', milestonesData);
      console.log('Teams data received:', teamsData);

      setProject(projectData);
      setMilestones(Array.isArray(milestonesData) ? milestonesData : []);
      setTeams(Array.isArray(teamsData) ? teamsData : []);

    } catch (error) {
      console.error('Error fetching project details:', error);
      console.error('Error response:', error.response);
      message.error('Không thể tải thông tin dự án: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h3>Không tìm thấy dự án</h3>
        <Link to="/student/projects">
          <Button type="primary">Quay lại danh sách dự án</Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Link to="/student/projects">
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: '24px' }}>
          Quay lại
        </Button>
      </Link>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{project.title}</h1>
            {project.classRoom && (
              <p style={{ color: '#666' }}>
                {project.classRoom.name} ({project.classRoom.code})
              </p>
            )}
          </div>
          <Tag color={getStatusColor(project.status)}>{project.status}</Tag>
        </div>

        <p style={{ marginBottom: '24px', color: '#666' }}>{project.description}</p>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarOutlined />
              <div>
                <div style={{ fontSize: '12px', color: '#999' }}>Hạn chót</div>
                <div style={{ fontWeight: 'bold' }}>
                  {project.deadline ? new Date(project.deadline).toLocaleDateString('vi-VN') : 'Không có hạn'}
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TeamOutlined />
              <div>
                <div style={{ fontSize: '12px', color: '#999' }}>Số nhóm</div>
                <div style={{ fontWeight: 'bold' }}>{teams.length} nhóm</div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlagOutlined />
              <div>
                <div style={{ fontSize: '12px', color: '#999' }}>Cột mốc</div>
                <div style={{ fontWeight: 'bold' }}>{milestones.length} cột mốc</div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="Cột mốc dự án" style={{ marginBottom: '24px' }}>
        {milestones.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>Chưa có cột mốc nào</p>
        ) : (
          <List
            dataSource={milestones}
            renderItem={(milestone) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<FlagOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
                  title={milestone.title}
                  description={milestone.description}
                />
                {milestone.dueDate && (
                  <div style={{ color: '#666' }}>
                    {new Date(milestone.dueDate).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </List.Item>
            )}
          />
        )}
      </Card>

      <Card title="Các nhóm">
        {teams.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>Chưa có nhóm nào</p>
        ) : (
          <Row gutter={[16, 16]}>
            {teams.map((team) => (
              <Col xs={24} sm={12} lg={8} key={team.id}>
                <Link to={`/student/teams/${team.id}`}>
                  <Card hoverable>
                    <Card.Meta
                      avatar={<TeamOutlined style={{ fontSize: '24px' }} />}
                      title={team.name}
                      description={`${team.members?.length || 0} thành viên`}
                    />
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </div>
  );
};

export default ProjectDetail;
