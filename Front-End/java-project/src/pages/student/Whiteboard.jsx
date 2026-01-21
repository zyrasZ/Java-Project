import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Select, Empty, Spin, message, Alert, Button } from 'antd';
import { TeamOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { RoomProvider, useOthers, useStatus } from '../../config/liveblocks';
import CollaborativeWhiteboard from '../../components/CollaborativeWhiteboard_Simple';
import studentService from '../../services/studentService';

// Component hiển thị số người online
function OnlineUsers() {
  const others = useOthers();
  const status = useStatus();
  const userCount = others.length;
  
  if (status === 'connecting') {
    return <Spin size="small" />;
  }
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      padding: '8px 16px',
      background: status === 'connected' ? '#f6ffed' : '#fff7e6',
      border: `1px solid ${status === 'connected' ? '#b7eb8f' : '#ffd591'}`,
      borderRadius: '8px'
    }}>
      <UserOutlined />
      <span style={{ fontSize: '14px', fontWeight: 500 }}>
        {status === 'connected' 
          ? (userCount === 0 ? 'Chỉ có bạn' : `${userCount + 1} người đang vẽ`)
          : 'Đang kết nối...'
        }
      </span>
    </div>
  );
}

// Wrapper component để hiển thị loading khi đang kết nối
function WhiteboardRoom({ roomId }) {
  const status = useStatus();
  
  if (status === 'initial' || status === 'connecting') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%' 
      }}>
        <Spin size="large" tip="Đang kết nối Liveblocks..." />
      </div>
    );
  }
  
  if (status === 'disconnected') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        gap: '16px'
      }}>
        <Alert
          message="Mất kết nối"
          description="Không thể kết nối đến Liveblocks. Vui lòng kiểm tra API key và kết nối internet."
          type="error"
          showIcon
        />
        <Button type="primary" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    );
  }
  
  return <CollaborativeWhiteboard />;
}

const Whiteboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    const teamIdParam = searchParams.get('teamId');
    if (teamIdParam && teams.length > 0) {
      const teamId = parseInt(teamIdParam);
      const team = teams.find(t => t.id === teamId);
      if (team) {
        setSelectedTeam(teamId);
      }
    } else if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].id);
    }
  }, [teams, searchParams]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await studentService.getMyTeams();
      const teamsArray = Array.isArray(data) ? data : [];
      setTeams(teamsArray);
    } catch (error) {
      console.error('Error fetching teams:', error);
      message.error('Không thể tải danh sách nhóm');
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamChange = (value) => {
    setSelectedTeam(value);
    setSearchParams({ teamId: value });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description="Bạn chưa tham gia nhóm nào" />
        </Card>
      </div>
    );
  }

  const currentTeam = teams.find(t => t.id === selectedTeam);
  const roomId = `team-${selectedTeam}-whiteboard`;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '16px 24px', 
        borderBottom: '1px solid #f0f0f0',
        background: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#262626' }}>
            Bảng vẽ cộng tác
          </h1>
          <p style={{ margin: 0, color: '#8c8c8c', fontSize: '14px' }}>
            Nhóm: {currentTeam?.name}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {selectedTeam && (
            <RoomProvider 
              id={roomId}
              initialPresence={{}}
            >
              <OnlineUsers />
            </RoomProvider>
          )}
          
          <Select
            value={selectedTeam}
            onChange={handleTeamChange}
            style={{ minWidth: '200px' }}
            size="large"
          >
            {teams.map((team) => (
              <Select.Option key={team.id} value={team.id}>
                <TeamOutlined style={{ marginRight: '8px' }} />
                {team.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Whiteboard Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        {selectedTeam && (
          <RoomProvider 
            id={roomId}
            initialPresence={{}}
          >
            <WhiteboardRoom roomId={roomId} />
          </RoomProvider>
        )}
      </div>
    </div>
  );
};

export default Whiteboard;
