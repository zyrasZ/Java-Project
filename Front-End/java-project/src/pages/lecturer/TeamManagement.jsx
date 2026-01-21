import { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Modal, Form, message, Space, Tag, 
  Select, InputNumber, Typography, Drawer, List, Avatar, Popconfirm,
  Input, Row, Col, Statistic, Divider, Empty, Alert
} from 'antd';
import { 
  TeamOutlined, PlusOutlined, UserAddOutlined, DeleteOutlined,
  UsergroupAddOutlined, ReloadOutlined, EyeOutlined, UserDeleteOutlined
} from '@ant-design/icons';
import lecturerService from '../../services/lecturerService';

const { Title, Text } = Typography;

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoGenModal, setAutoGenModal] = useState(false);
  const [teamDetailDrawer, setTeamDetailDrawer] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [autoGenForm] = Form.useForm();
  const [addMemberForm] = Form.useForm();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await lecturerService.getMyProjects();
      const approvedProjects = (response.data.data || []).filter(p => p.status === 'APPROVED');
      setProjects(approvedProjects);
    } catch (_error) {
      message.error('Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamsByProject = async (projectId) => {
    try {
      setLoading(true);
      const response = await lecturerService.getTeamsByProject(projectId);
      setTeams(response.data.data || []);
    } catch (_error) {
      message.error('Không thể tải danh sách nhóm');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsInClass = async (classroomId) => {
    try {
      const response = await lecturerService.getClassById(classroomId);
      setStudents(response.data.data?.students || []);
    } catch (_error) {
      console.error('Error fetching students:', _error);
    }
  };

  const handleProjectChange = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project);
    
    if (project) {
      await fetchTeamsByProject(projectId);
      if (project.classRoom?.id) {
        await fetchStudentsInClass(project.classRoom.id);
      }
    }
  };

  const handleAutoGenerate = async (values) => {
    try {
      setLoading(true);
      await lecturerService.autoGenerateTeams(values);
      message.success('Tạo nhóm tự động thành công');
      setAutoGenModal(false);
      autoGenForm.resetFields();
      
      if (selectedProject) {
        await fetchTeamsByProject(selectedProject.id);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Tạo nhóm thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTeam = async (team) => {
    try {
      const response = await lecturerService.getTeamById(team.id);
      setSelectedTeam(response.data.data);
      setTeamDetailDrawer(true);
    } catch (_error) {
      message.error('Không thể tải thông tin nhóm');
    }
  };

  const handleAddMember = async (values) => {
    try {
      await lecturerService.addMemberToTeam(selectedTeam.id, values.userId);
      message.success('Thêm thành viên thành công');
      addMemberForm.resetFields();
      
      // Refresh team detail
      const response = await lecturerService.getTeamById(selectedTeam.id);
      setSelectedTeam(response.data.data);
      
      // Refresh team list
      if (selectedProject) {
        await fetchTeamsByProject(selectedProject.id);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Thêm thành viên thất bại');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await lecturerService.removeMemberFromTeam(selectedTeam.id, userId);
      message.success('Xóa thành viên thành công');
      
      // Refresh team detail
      const response = await lecturerService.getTeamById(selectedTeam.id);
      setSelectedTeam(response.data.data);
      
      // Refresh team list
      if (selectedProject) {
        await fetchTeamsByProject(selectedProject.id);
      }
    } catch (error) {
      message.error('Xóa thành viên thất bại');
    }
  };

  const handleDeleteAllTeams = async () => {
    try {
      setLoading(true);
      await lecturerService.deleteAllTeams(selectedProject.id);
      message.success('Xóa tất cả nhóm thành công');
      setTeams([]);
    } catch (_error) {
      message.error('Xóa nhóm thất bại');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableStudents = () => {
    if (!selectedTeam || !students) return [];
    
    const teamMemberIds = selectedTeam.members?.map(m => m.id) || [];
    return students.filter(s => !teamMemberIds.includes(s.id));
  };

  const columns = [
    {
      title: 'Tên nhóm',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Tag color="blue" style={{ fontSize: '14px' }}>{name}</Tag>
    },
    {
      title: 'Số thành viên',
      dataIndex: 'members',
      key: 'memberCount',
      render: (members) => (
        <Space>
          <TeamOutlined />
          <Text strong>{members?.length || 0}</Text>
        </Space>
      )
    },
    {
      title: 'Danh sách thành viên',
      dataIndex: 'members',
      key: 'memberList',
      render: (members) => (
        <Space wrap>
          {members?.slice(0, 3).map(member => (
            <Tag key={member.id}>{member.fullName}</Tag>
          ))}
          {members?.length > 3 && <Tag>+{members.length - 3} khác</Tag>}
        </Space>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewTeam(record)}
          >
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>
          <TeamOutlined /> Quản lý nhóm
        </Title>
      </div>

      {/* Project Selection */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Text strong style={{ marginRight: '8px' }}>Chọn dự án:</Text>
            <Select
              style={{ width: '100%', maxWidth: '500px' }}
              placeholder="Chọn dự án đã được duyệt"
              onChange={handleProjectChange}
              value={selectedProject?.id}
              loading={loading}
            >
              {projects.map(project => (
                <Select.Option key={project.id} value={project.id}>
                  {project.title} - {project.classRoom?.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          {selectedProject && (
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<UsergroupAddOutlined />}
                  onClick={() => setAutoGenModal(true)}
                >
                  Tạo nhóm tự động
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchTeamsByProject(selectedProject.id)}
                >
                  Làm mới
                </Button>
                {teams.length > 0 && (
                  <Popconfirm
                    title="Xóa tất cả nhóm?"
                    description="Bạn có chắc muốn xóa tất cả nhóm của dự án này?"
                    onConfirm={handleDeleteAllTeams}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      Xóa tất cả nhóm
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            </Col>
          )}
        </Row>
      </Card>

      {/* Statistics */}
      {selectedProject && (
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng số nhóm"
                value={teams.length}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng sinh viên"
                value={students.length}
                prefix={<UserAddOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Sinh viên đã có nhóm"
                value={teams.reduce((sum, team) => sum + (team.members?.length || 0), 0)}
                prefix={<UsergroupAddOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Teams Table */}
      <Card title={selectedProject ? `Danh sách nhóm - ${selectedProject.title}` : 'Danh sách nhóm'}>
        {selectedProject ? (
          <Table
            columns={columns}
            dataSource={teams}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'Chưa có nhóm nào. Hãy tạo nhóm tự động!' }}
          />
        ) : (
          <Empty description="Vui lòng chọn dự án để xem danh sách nhóm" />
        )}
      </Card>

      {/* Auto Generate Modal */}
      <Modal
        title="Tạo nhóm tự động"
        open={autoGenModal}
        onCancel={() => {
          setAutoGenModal(false);
          autoGenForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={autoGenForm}
          layout="vertical"
          onFinish={handleAutoGenerate}
          initialValues={{ projectId: selectedProject?.id }}
        >
          <Form.Item
            name="projectId"
            label="Dự án"
            rules={[{ required: true, message: 'Vui lòng chọn dự án' }]}
          >
            <Select placeholder="Chọn dự án" disabled={!!selectedProject}>
              {projects.map(project => (
                <Select.Option key={project.id} value={project.id}>
                  {project.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="teamSize"
            label="Số thành viên mỗi nhóm"
            rules={[{ required: true, message: 'Vui lòng nhập số thành viên' }]}
          >
            <InputNumber 
              min={2} 
              max={10} 
              style={{ width: '100%' }}
              placeholder="Ví dụ: 5"
            />
          </Form.Item>
          <Alert
            message="Lưu ý"
            description={`Hệ thống sẽ tự động chia ${students.length} sinh viên thành các nhóm. Nếu không chia đều, nhóm cuối sẽ có ít thành viên hơn.`}
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo nhóm
              </Button>
              <Button onClick={() => {
                setAutoGenModal(false);
                autoGenForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Team Detail Drawer */}
      <Drawer
        title={
          <Space>
            <TeamOutlined />
            <span>{selectedTeam?.name}</span>
          </Space>
        }
        open={teamDetailDrawer}
        onClose={() => {
          setTeamDetailDrawer(false);
          setSelectedTeam(null);
        }}
        width={500}
      >
        {selectedTeam && (
          <>
            {/* Project Info */}
            <Card size="small" style={{ marginBottom: '16px' }}>
              <Text strong>Dự án: </Text>
              <Text>{selectedTeam.project?.title}</Text>
            </Card>

            {/* Add Member Section */}
            <Card 
              title={
                <Space>
                  <UserAddOutlined />
                  <span>Thêm thành viên</span>
                </Space>
              }
              size="small" 
              style={{ marginBottom: '16px' }}
            >
              <Form
                form={addMemberForm}
                layout="inline"
                onFinish={handleAddMember}
              >
                <Form.Item
                  name="userId"
                  rules={[{ required: true, message: 'Chọn sinh viên' }]}
                  style={{ flex: 1 }}
                >
                  <Select 
                    placeholder="Chọn sinh viên"
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {getAvailableStudents().map(student => (
                      <Select.Option key={student.id} value={student.id}>
                        {student.fullName} ({student.email})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                    Thêm
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            {/* Members List */}
            <Divider>
              Danh sách thành viên ({selectedTeam.members?.length || 0})
            </Divider>
            <List
              dataSource={selectedTeam.members || []}
              locale={{ emptyText: 'Chưa có thành viên nào' }}
              renderItem={(member) => (
                <List.Item
                  actions={[
                    <Popconfirm
                      key="delete"
                      title="Xóa thành viên này?"
                      onConfirm={() => handleRemoveMember(member.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button 
                        type="link" 
                        danger 
                        size="small"
                        icon={<UserDeleteOutlined />}
                      >
                        Xóa
                      </Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: '#1890ff' }}>
                        {member.fullName?.charAt(0)}
                      </Avatar>
                    }
                    title={member.fullName}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">{member.email}</Text>
                        <Tag color="blue">{member.role}</Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        )}
      </Drawer>
    </div>
  );
};

export default TeamManagement;
