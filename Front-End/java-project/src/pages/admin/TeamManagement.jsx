import { useState, useEffect, useContext } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Popconfirm,
  Typography,
  Card,
  Row,
  Col,
  Tooltip,
  Tag,
  Select,
  InputNumber,
  App,
  Descriptions,
  Avatar,
  List,
  Divider,
  Tabs,
  Badge,
  Empty
} from 'antd';
import {
  PlusOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  RobotOutlined,
  ProjectOutlined,
  CheckOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import { AuthContext } from '../../contexts/AuthContext';

const { Title } = Typography;

const TeamManagement = () => {
  const { message } = App.useApp();
  const { user } = useContext(AuthContext);
  const [allTeams, setAllTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [autoGenModalVisible, setAutoGenModalVisible] = useState(false);
  const [teamDetailModalVisible, setTeamDetailModalVisible] = useState(false);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [autoGenForm] = Form.useForm();
  const [addMemberForm] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchProjects(),
          fetchUsers(),
          fetchAllTeams()
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProjects(),
        fetchUsers(),
        fetchAllTeams()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await adminService.getAllProjectsIncludingPending();
      if (response && response.status === 'success') {
        setProjects(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setProjects([]);
    }
  };

  const fetchAllTeams = async () => {
    try {
      const response = await adminService.getAllProjectsIncludingPending();
      
      if (response && response.status === 'success') {
        const projects = response.data || [];
        let allTeams = [];
        
        // Fetch teams for each project
        for (const project of projects) {
          try {
            const teamResponse = await adminService.getTeamsByProject(project.id);
            if (teamResponse && teamResponse.status === 'success') {
              const projectTeams = teamResponse.data || [];
              const teamsWithProject = projectTeams.map(team => ({
                ...team,
                projectInfo: project
              }));
              allTeams = [...allTeams, ...teamsWithProject];
            }
          } catch (err) {
            console.error(`Error fetching teams for project ${project.id}:`, err);
          }
        }
        
        setAllTeams(allTeams);
      }
    } catch (err) {
      console.error('Error fetching all teams:', err);
      setAllTeams([]);
    }
  };


  const fetchUsers = async () => {
    try {
      const response = await adminService.getAllUsers({ size: 1000 });
      
      if (response && response.status === 'success') {
        // Filter only active students
        const students = response.data?.content?.filter(user => 
          user.role === 'STUDENT' && user.active
        ) || [];
        setUsers(students);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    }
  };

  // API 5.1: Auto generate teams
  const handleAutoGenerate = async (values) => {
    try {
      const response = await adminService.autoGenerateTeams({
        projectId: values.projectId,
        teamSize: values.teamSize
      });
      
      if (response && response.status === 'success') {
        message.success(response.message || `Tạo thành công ${response.data.length} team`);
        await fetchAllTeams();
        setAutoGenModalVisible(false);
        autoGenForm.resetFields();
      }
    } catch (err) {
      console.error('Error auto generating teams:', err);
      message.error(err.response?.data?.message || 'Tạo team tự động thất bại');
    }
  };

  // API 5.5: Add member to team
  const handleAddMember = async (values) => {
    const userId = values.userId;
    const teamId = selectedTeam?.id;
    const selectedStudent = users.find(u => u.id === userId);
    
    try {
      console.log('🚀 Adding member:', { teamId, userId });
      
      // Try to add member (ignore error for now)
      await adminService.addMemberToTeam(teamId, userId);
      
    } catch (err) {
      console.log('⚠️ Add member API returned error (will verify by checking team data):', err.message);
      // Don't show error yet, we'll verify by checking the actual team data
    }
    
    // Close modal and reset form
    setAddMemberModalVisible(false);
    addMemberForm.resetFields();
    
    // Wait a bit for backend to commit
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Refresh all teams data
    await fetchAllTeams();
    
    // Fetch fresh team data to verify if member was added
    try {
      const verifyResponse = await adminService.getTeamById(teamId);
      
      if (verifyResponse && verifyResponse.status === 'success') {
        const updatedTeam = verifyResponse.data;
        
        // Check if user is now in the team
        const memberExists = updatedTeam.members?.some(member => member.id === userId);
        
        if (memberExists) {
          message.success(`✅ Đã thêm ${selectedStudent?.fullName || 'sinh viên'} vào team ${selectedTeam?.name} thành công!`);
          
          // Update selected team if detail modal is open
          if (teamDetailModalVisible) {
            setSelectedTeam(updatedTeam);
          }
        } else {
          message.error(`❌ Không thể thêm ${selectedStudent?.fullName || 'sinh viên'} vào team. Vui lòng thử lại!`);
        }
      }
    } catch (verifyErr) {
      console.error('❌ Error verifying member addition:', verifyErr);
      message.error('Không thể xác nhận kết quả. Vui lòng kiểm tra lại team!');
    }
  };

  // API 5.6: Remove member from team
  const handleRemoveMember = async (teamId, userId) => {
    try {
      const response = await adminService.removeMemberFromTeam(teamId, userId);
      
      if (response && response.status === 'success') {
        message.success('Xóa thành viên thành công');
        await fetchAllTeams();
        
        // Refresh team detail if modal is open
        if (selectedTeam && selectedTeam.id === teamId) {
          const updatedTeam = await adminService.getTeamById(teamId);
          if (updatedTeam && updatedTeam.status === 'success') {
            setSelectedTeam(updatedTeam.data);
          }
        }
      }
    } catch (err) {
      console.error('Error removing member:', err);
      message.error(err.response?.data?.message || 'Xóa thành viên thất bại');
    }
  };

  // API 5.7: Delete all teams of project
  const handleDeleteAllTeams = async (projectId) => {
    try {
      const response = await adminService.deleteTeamsByProject(projectId);
      
      if (response && response.status === 'success') {
        message.success('Xóa tất cả team thành công');
        await fetchAllTeams();
      }
    } catch (err) {
      console.error('Error deleting teams:', err);
      message.error(err.response?.data?.message || 'Xóa team thất bại');
    }
  };

  // Approve project
  const handleApproveProject = async (projectId, projectTitle) => {
    try {
      const response = await adminService.approveProject(projectId);
      
      if (response && response.status === 'success') {
        message.success(`Đã duyệt dự án "${projectTitle}" thành công!`);
        await fetchAllTeams();
      }
    } catch (err) {
      console.error('Error approving project:', err);
      message.error(err.response?.data?.message || 'Duyệt dự án thất bại');
    }
  };

  // API 5.4: Get team by ID
  const handleViewTeamDetail = async (team) => {
    try {
      console.log('🔍 Viewing team detail for:', team);
      const response = await adminService.getTeamById(team.id);
      console.log('✅ Team detail response:', response);
      
      if (response && response.status === 'success') {
        setSelectedTeam(response.data);
        setTeamDetailModalVisible(true);
      } else {
        console.error('❌ Invalid response format:', response);
        message.error('Phản hồi từ server không đúng định dạng');
      }
    } catch (err) {
      console.error('❌ Error fetching team details:', err);
      message.error(err.response?.data?.message || 'Không thể lấy thông tin chi tiết team');
    }
  };

  const handleAddMemberToTeam = async (team) => {
    try {
      // Fetch fresh team data to get latest members
      const teamResponse = await adminService.getTeamById(team.id);
      const freshTeam = teamResponse?.data || team;
      
      // Filter users who are not already in this team
      const availableUsers = users.filter(user => 
        !freshTeam.members?.some(member => member.id === user.id)
      );
      
      setSelectedTeam({
        ...freshTeam,
        availableUsers: availableUsers
      });
      addMemberForm.resetFields();
      setAddMemberModalVisible(true);
    } catch (err) {
      console.error('Error opening add member modal:', err);
      message.error('Không thể mở form thêm thành viên');
    }
  };

  // Filter teams based on search text
  const filterTeams = (teamList) => {
    return teamList.filter(team => {
      const searchLower = searchText.toLowerCase();
      const teamName = team.name?.toLowerCase() || '';
      const projectName = team.project?.title || team.projectInfo?.title || '';
      const projectNameLower = projectName.toLowerCase();
      const memberNames = team.members?.map(m => m.fullName?.toLowerCase() || '').join(' ') || '';
      
      return teamName.includes(searchLower) || 
             projectNameLower.includes(searchLower) || 
             memberNames.includes(searchLower);
    });
  };

  const getCurrentData = () => {
    return filterTeams(allTeams);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Tên team',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            ID: {record.id}
          </div>
        </div>
      ),
    },
    {
      title: 'Dự án',
      key: 'project',
      ellipsis: true,
      render: (_, record) => {
        const project = record.project || record.projectInfo;
        if (!project) return 'N/A';
        
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>{project.title}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <Tag 
                color={
                  project.status === 'APPROVED' ? 'green' : 
                  project.status === 'PENDING' ? 'orange' : 
                  project.status === 'REJECTED' ? 'red' : 'default'
                }
                size="small"
              >
                {project.status}
              </Tag>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Số thành viên',
      key: 'memberCount',
      width: 120,
      render: (_, record) => {
        const memberCount = record.members?.length || 0;
        return (
          <Badge 
            count={memberCount} 
            showZero 
            color={memberCount > 0 ? '#52c41a' : '#d9d9d9'}
          />
        );
      },
    },
    {
      title: 'Thành viên',
      key: 'members',
      ellipsis: true,
      render: (_, record) => {
        const members = record.members || [];
        if (members.length === 0) {
          return <span style={{ color: '#999' }}>Chưa có thành viên</span>;
        }
        
        const displayMembers = members.slice(0, 2);
        const remainingCount = members.length - 2;
        
        return (
          <div>
            {displayMembers.map((member) => (
              <div key={member.id} style={{ fontSize: '12px' }}>
                <UserOutlined style={{ marginRight: '4px' }} />
                {member.fullName || member.email}
              </div>
            ))}
            {remainingCount > 0 && (
              <div style={{ fontSize: '11px', color: '#666' }}>
                +{remainingCount} thành viên khác
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 250,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewTeamDetail(record)}
            />
          </Tooltip>
          {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
            <>
              <Tooltip title="Thêm thành viên">
                <Button
                  size="small"
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => handleAddMemberToTeam(record)}
                />
              </Tooltip>
              <Tooltip title="Xóa tất cả team của dự án này">
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa tất cả team của dự án này?"
                  onConfirm={() => handleDeleteAllTeams(record.projectInfo?.id || record.project?.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];



  return (
    <div>
      <Title level={2}>
        <TeamOutlined style={{ marginRight: '8px' }} />
        Quản lý Team
      </Title>

      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm team, dự án hoặc thành viên"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={16}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
              {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
                <Button
                  type="primary"
                  icon={<RobotOutlined />}
                  onClick={() => setAutoGenModalVisible(true)}
                >
                  Tạo team tự động
                </Button>
              )}
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchInitialData}
                loading={loading}
              >
                Làm mới
              </Button>
            </div>
          </Col>
        </Row>


      </Card>

      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Tag color="blue">
            Hiển thị: {getCurrentData().length} team
          </Tag>
          <Tag color="green">
            Tổng team: {allTeams.length}
          </Tag>
          <Tag color="orange">
            Tổng thành viên: {allTeams.reduce((total, team) => total + (team.members?.length || 0), 0)}
          </Tag>
        </div>

        <Table
          columns={columns}
          dataSource={getCurrentData()}
          rowKey={(record) => record.id}
          loading={loading}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: searchText ? 'Không tìm thấy team nào' : 'Chưa có team nào'
          }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} team`,
            pageSizeOptions: ['10', '20', '50', '100'],
            defaultPageSize: 20
          }}
        />
      </Card>

      {/* Auto Generate Teams Modal */}
      <Modal
        title="Tạo team tự động"
        open={autoGenModalVisible}
        onCancel={() => setAutoGenModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={autoGenForm}
          layout="vertical"
          onFinish={handleAutoGenerate}
        >
          <Form.Item
            name="projectId"
            label="Chọn dự án"
            rules={[{ required: true, message: 'Vui lòng chọn dự án' }]}
          >
            <Select
              placeholder="Chọn dự án để tạo team"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {projects.filter(p => p.status === 'APPROVED').map(project => (
                <Select.Option key={project.id} value={project.id}>
                  {project.title} ({project.status})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="teamSize"
            label="Số thành viên mỗi team"
            rules={[{ required: true, message: 'Vui lòng nhập số thành viên' }]}
          >
            <InputNumber 
              min={2} 
              max={10} 
              placeholder="Ví dụ: 5"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
            <div style={{ color: '#52c41a', fontWeight: 'bold', marginBottom: '4px' }}>
              ℹ️ Lưu ý về tạo team tự động
            </div>
            <div style={{ color: '#389e0d', fontSize: '12px' }}>
              • Hệ thống sẽ tự động chia sinh viên trong lớp thành các team
              <br />
              • Sinh viên được phân bổ ngẫu nhiên
              <br />
              • Nếu có dư sinh viên, họ sẽ được phân vào các team hiện có
            </div>
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setAutoGenModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo team
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Team Detail Modal */}
      <Modal
        title={`Chi tiết team: ${selectedTeam?.name}`}
        open={teamDetailModalVisible}
        onCancel={() => setTeamDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedTeam && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: '16px' }}>
              <Descriptions.Item label="ID Team">
                {selectedTeam?.id}
              </Descriptions.Item>
              <Descriptions.Item label="Tên team">
                {selectedTeam?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Số thành viên">
                <Badge 
                  count={selectedTeam?.members?.length || 0} 
                  showZero 
                  color="#52c41a"
                />
              </Descriptions.Item>
              <Descriptions.Item label="Dự án">
                <div>
                  <div>{selectedTeam?.project?.title}</div>
                  <Tag 
                    color={
                      selectedTeam?.project?.status === 'APPROVED' ? 'green' : 
                      selectedTeam?.project?.status === 'PENDING' ? 'orange' : 'red'
                    }
                    size="small"
                  >
                    {selectedTeam?.project?.status}
                  </Tag>
                </div>
              </Descriptions.Item>
              {selectedTeam?.project?.deadline && (
                <Descriptions.Item label="Deadline dự án" span={2}>
                  {new Date(selectedTeam?.project.deadline).toLocaleString('vi-VN')}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider>Danh sách thành viên</Divider>
            
            {selectedTeam?.members && selectedTeam?.members.length > 0 ? (
              <List
                dataSource={selectedTeam?.members}
                renderItem={(member) => (
                  <List.Item
                    actions={[
                      (user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
                        <Popconfirm
                          key="remove"
                          title="Bạn có chắc chắn muốn xóa thành viên này khỏi team?"
                          onConfirm={() => handleRemoveMember(selectedTeam?.id, member.id)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button 
                            danger 
                            size="small" 
                            icon={<UserDeleteOutlined />}
                          >
                            Xóa
                          </Button>
                        </Popconfirm>
                      )
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={member.fullName || member.email}
                      description={
                        <div>
                          <div>Email: {member.email}</div>
                          <div>Role: <Tag size="small">{member.role}</Tag></div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description="Team này chưa có thành viên nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Add Member Modal */}
      <Modal
        title={`Thêm thành viên vào team: ${selectedTeam?.name}`}
        open={addMemberModalVisible}
        onCancel={() => setAddMemberModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedTeam && (
          <div>
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px' }}>
              <div style={{ color: '#1890ff', fontWeight: 'bold', marginBottom: '4px' }}>
                ℹ️ Thông tin team
              </div>
              <div style={{ color: '#096dd9', fontSize: '12px' }}>
                Project: {selectedTeam?.project?.title || selectedTeam?.projectInfo?.title}
                <br />
                Classroom: {selectedTeam?.project?.classRoom?.name || selectedTeam?.projectInfo?.classRoom?.name}
                <br />
                Thành viên hiện tại: {selectedTeam?.members?.length || 0}
              </div>
            </div>
            
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: '6px' }}>
              <div style={{ color: '#fa8c16', fontWeight: 'bold', marginBottom: '4px' }}>
                ℹ️ Thông tin thêm thành viên
              </div>
              <div style={{ color: '#d46b08', fontSize: '12px' }}>
                • Chỉ hiển thị sinh viên chưa có trong team này
                <br />
                • Sinh viên khả dụng: {selectedTeam?.availableUsers?.length || 0}
                <br />
                • Nếu không có sinh viên nào, có thể tất cả đã được thêm vào team
              </div>
            </div>
          </div>
        )}
        
        <Form
          form={addMemberForm}
          layout="vertical"
          onFinish={handleAddMember}
        >
          <Form.Item
            name="userId"
            label="Chọn sinh viên"
            rules={[{ required: true, message: 'Vui lòng chọn sinh viên' }]}
          >
            <Select
              placeholder="Chọn sinh viên để thêm vào team..."
              showSearch
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) => {
                if (!input) return true;
                const searchTerm = input.toLowerCase();
                const optionText = String(option?.children || '').toLowerCase();
                return optionText.includes(searchTerm);
              }}
              size="large"
              notFoundContent={
                (!selectedTeam?.availableUsers || selectedTeam?.availableUsers.length === 0) ? 
                "Tất cả sinh viên đã có trong team này" : 
                "Không tìm thấy sinh viên phù hợp"
              }
            >
              {(selectedTeam?.availableUsers || []).map(user => (
                <Select.Option 
                  key={user.id} 
                  value={user.id}
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{user.fullName}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setAddMemberModalVisible(false)}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<UserAddOutlined />}
                disabled={!selectedTeam?.availableUsers || selectedTeam?.availableUsers.length === 0}
              >
                Thêm thành viên
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeamManagement;