import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Statistic, List, Tag, Spin, message } from 'antd';
import {
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import studentService from '../../services/studentService';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalTasks: 0,
    todoTasks: 0,
    doingTasks: 0,
    doneTasks: 0,
    overdueTasks: 0
  });
  const [myTeams, setMyTeams] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [teams, tasks] = await Promise.all([
        studentService.getMyTeams(),
        studentService.getMyTasksDTO()
      ]);

      const teamsArray = Array.isArray(teams) ? teams : [];
      const tasksArray = Array.isArray(tasks) ? tasks : [];
      
      setMyTeams(teamsArray);

      const todoCount = tasksArray.filter(t => t.status === 'TODO').length;
      const doingCount = tasksArray.filter(t => t.status === 'DOING').length;
      const doneCount = tasksArray.filter(t => t.status === 'DONE').length;
      
      const now = new Date();
      const overdueCount = tasksArray.filter(t => 
        t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now
      ).length;

      setStats({
        totalTeams: teamsArray.length,
        totalTasks: tasksArray.length,
        todoTasks: todoCount,
        doingTasks: doingCount,
        doneTasks: doneCount,
        overdueTasks: overdueCount
      });

      setRecentTasks(tasksArray.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return 'default';
      case 'DOING': return 'processing';
      case 'DONE': return 'success';
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

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#262626' }}>
          Trang chủ sinh viên
        </h1>
        <p style={{ color: '#8c8c8c' }}>Chào mừng bạn quay trở lại!</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Nhóm của tôi"
              value={stats.totalTeams}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng công việc"
              value={stats.totalTasks}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang làm"
              value={stats.doingTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Quá hạn"
              value={stats.overdueTasks}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={8}>
          <Card title="Trạng thái công việc">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cần làm</span>
                <span style={{ fontWeight: 'bold' }}>{stats.todoTasks}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Đang làm</span>
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{stats.doingTasks}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hoàn thành</span>
                <span style={{ fontWeight: 'bold', color: '#52c41a' }}>{stats.doneTasks}</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card 
            title="Nhóm của tôi" 
            extra={<Link to="/student/teams">Xem tất cả</Link>}
          >
            {myTeams.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>Chưa có nhóm nào</p>
            ) : (
              <List
                dataSource={myTeams.slice(0, 3)}
                renderItem={(team) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<TeamOutlined style={{ fontSize: '24px' }} />}
                      title={<Link to={`/student/teams/${team.id}`}>{team.name}</Link>}
                      description={team.project?.title || 'Chưa có dự án'}
                    />
                    <div>{team.members?.length || 0} thành viên</div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Card 
        title="Công việc gần đây" 
        extra={<Link to="/student/tasks">Xem tất cả</Link>}
      >
        {recentTasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '32px 0' }}>Chưa có công việc nào</p>
        ) : (
          <List
            dataSource={recentTasks}
            renderItem={(task) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<FileTextOutlined style={{ fontSize: '20px' }} />}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{task.title}</span>
                      <Tag color={getStatusColor(task.status)}>{task.status}</Tag>
                    </div>
                  }
                  description={
                    <div>
                      {task.description && <div>{task.description}</div>}
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                        Nhóm: {task.teamName || 'N/A'} • Độ ưu tiên: {task.priority || 1}
                        {task.dueDate && ` • Hạn: ${new Date(task.dueDate).toLocaleDateString('vi-VN')}`}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default StudentDashboard;
