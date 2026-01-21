import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Typography, Tag, Space, Spin } from 'antd';
import {
  BookOutlined,
  ProjectOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import lecturerService from '../../services/lecturerService';

const { Title, Text } = Typography;

const LecturerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    classCount: 0,
    projectCount: 0,
    teamCount: 0,
    taskCount: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [classesRes, projectsRes, teamsRes, tasksRes] = await Promise.all([
        lecturerService.getMyClasses(),
        lecturerService.getMyProjects(),
        lecturerService.getMyTeams(),
        lecturerService.getMyTasks()
      ]);

      setStats({
        classCount: classesRes.data.data?.length || 0,
        projectCount: projectsRes.data.data?.length || 0,
        teamCount: teamsRes.data.data?.length || 0,
        taskCount: tasksRes.data.data?.length || 0
      });

      setRecentProjects(projectsRes.data.data?.slice(0, 5) || []);
      setMyTasks(tasksRes.data.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'default',
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'error',
      TODO: 'default',
      DOING: 'processing',
      DONE: 'success'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Tổng quan</Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/lecturer/classes')}>
            <Statistic
              title="Lớp học"
              value={stats.classCount}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/lecturer/projects')}>
            <Statistic
              title="Dự án"
              value={stats.projectCount}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/lecturer/teams')}>
            <Statistic
              title="Nhóm"
              value={stats.teamCount}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => navigate('/lecturer/tasks')}>
            <Statistic
              title="Công việc"
              value={stats.taskCount}
              prefix={<CheckSquareOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Projects and Tasks */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <ProjectOutlined />
                <span>Dự án gần đây</span>
              </Space>
            }
            extra={<a onClick={() => navigate('/lecturer/projects')}>Xem tất cả</a>}
          >
            <List
              dataSource={recentProjects}
              locale={{ emptyText: 'Chưa có dự án nào' }}
              renderItem={(project) => (
                <List.Item
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/lecturer/projects/${project.id}`)}
                >
                  <List.Item.Meta
                    title={project.title}
                    description={
                      <Space>
                        <Tag color={getStatusColor(project.status)}>
                          {project.status}
                        </Tag>
                        {project.classRoom && (
                          <Text type="secondary">{project.classRoom.name}</Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <CheckSquareOutlined />
                <span>Công việc của tôi</span>
              </Space>
            }
            extra={<a onClick={() => navigate('/lecturer/tasks')}>Xem tất cả</a>}
          >
            <List
              dataSource={myTasks}
              locale={{ emptyText: 'Chưa có công việc nào' }}
              renderItem={(task) => (
                <List.Item>
                  <List.Item.Meta
                    title={task.title}
                    description={
                      <Space>
                        <Tag color={getStatusColor(task.status)}>
                          {task.status}
                        </Tag>
                        {task.dueDate && (
                          <Text type="secondary">
                            <ClockCircleOutlined /> {new Date(task.dueDate).toLocaleDateString()}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Thao tác nhanh">
            <Space size="large" wrap>
              <Card.Grid 
                style={{ width: '200px', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => navigate('/lecturer/classes/create')}
              >
                <BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <div style={{ marginTop: '8px' }}>Tạo lớp học</div>
              </Card.Grid>
              <Card.Grid 
                style={{ width: '200px', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => navigate('/lecturer/projects/create')}
              >
                <ProjectOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                <div style={{ marginTop: '8px' }}>Tạo dự án</div>
              </Card.Grid>
              <Card.Grid 
                style={{ width: '200px', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => navigate('/lecturer/grading')}
              >
                <TrophyOutlined style={{ fontSize: '24px', color: '#faad14' }} />
                <div style={{ marginTop: '8px' }}>Chấm điểm</div>
              </Card.Grid>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LecturerDashboard;
