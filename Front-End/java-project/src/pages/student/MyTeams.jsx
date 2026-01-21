import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Input, Spin, Empty, Button, message } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  FolderOutlined,
  MessageOutlined,
  EditOutlined
} from '@ant-design/icons';
import studentService from '../../services/studentService';

const { Search } = Input;

const MyTeams = () => {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await studentService.getMyTeams();
      const teamsArray = Array.isArray(data) ? data : [];
      setTeams(teamsArray);
      setFilteredTeams(teamsArray);
    } catch (error) {
      console.error('Error fetching teams:', error);
      message.error('Không thể tải danh sách nhóm');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    if (!value) {
      setFilteredTeams(teams);
      return;
    }

    const filtered = teams.filter(team =>
      team.name.toLowerCase().includes(value.toLowerCase()) ||
      team.project?.title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTeams(filtered);
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
          Nhóm của tôi
        </h1>
        <p style={{ color: '#8c8c8c' }}>Các nhóm bạn đang tham gia</p>
      </div>

      <Search
        placeholder="Tìm kiếm nhóm..."
        onSearch={handleSearch}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ marginBottom: '24px' }}
        size="large"
        allowClear
      />

      {filteredTeams.length === 0 ? (
        <Empty description="Không tìm thấy nhóm nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredTeams.map((team) => (
            <Col xs={24} sm={12} lg={8} key={team.id}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TeamOutlined />
                    <span>{team.name}</span>
                  </div>
                }
                extra={<span style={{ fontSize: '14px', color: '#666' }}>{team.members?.length || 0} thành viên</span>}
              >
                {team.project && (
                  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                    <FolderOutlined />
                    <span>{team.project.title}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <Link to={`/student/teams/${team.id}`}>
                    <Button size="small" icon={<UserOutlined />} block>
                      Chi tiết
                    </Button>
                  </Link>
                  <Link to={`/student/chat?teamId=${team.id}`}>
                    <Button size="small" icon={<MessageOutlined />} block>
                      Chat
                    </Button>
                  </Link>
                  <Link to={`/student/whiteboard?teamId=${team.id}`}>
                    <Button size="small" icon={<EditOutlined />} block>
                      Bảng
                    </Button>
                  </Link>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default MyTeams;
