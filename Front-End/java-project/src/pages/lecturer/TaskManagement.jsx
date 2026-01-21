import { useState, useEffect } from 'react';
import { 
  Card, Button, Modal, Form, message, Space, Tag, 
  Select, Input, Typography, Drawer, Row, Col, Statistic,
  DatePicker, Tabs, List, Avatar, Popconfirm, Badge, Empty, Alert
} from 'antd';
import { 
  CheckSquareOutlined, PlusOutlined, EyeOutlined, EditOutlined,
  DeleteOutlined, ClockCircleOutlined, UserOutlined, TeamOutlined,
  WarningOutlined, ReloadOutlined
} from '@ant-design/icons';
import lecturerService from '../../services/lecturerService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TaskManagement = () => {
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [kanbanData, setKanbanData] = useState({ TODO: [], DOING: [], DONE: [] });
  const [myTasks, setMyTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [taskDetailDrawer, setTaskDetailDrawer] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('kanban');

  const fetchProjects = async () => {
    try {
      const response = await lecturerService.getMyProjects();
      const approvedProjects = (response.data.data || []).filter(p => p.status === 'APPROVED');
      setProjects(approvedProjects);
    } catch {
      message.error('Không thể tải danh sách dự án');
    }
  };

  const fetchTeamsByProject = async (projectId) => {
    try {
      const response = await lecturerService.getTeamsByProject(projectId);
      setTeams(response.data.data || []);
    } catch {
      message.error('Không thể tải danh sách nhóm');
    }
  };

  const fetchKanbanBoard = async (teamId) => {
    try {
      const response = await lecturerService.getKanbanBoard(teamId);
      const data = response.data.data;
      
      // Transform backend format to frontend format
      const kanban = {
        TODO: data.todoTasks || [],
        DOING: data.doingTasks || [],
        DONE: data.doneTasks || []
      };
      
      setKanbanData(kanban);
    } catch (error) {
      console.error('Kanban board error:', error);
      // Set empty data instead of showing error
      setKanbanData({ TODO: [], DOING: [], DONE: [] });
      // Only show error if it's not a 500 (might be empty data)
      if (error.response?.status !== 500) {
        message.error('Không thể tải Kanban board');
      }
    }
  };

  const fetchOverdueTasks = async (teamId) => {
    try {
      const response = await lecturerService.getOverdueTasks(teamId);
      setOverdueTasks(response.data.data || []);
    } catch (error) {
      console.error('Overdue tasks error:', error);
      // Set empty array on error
      setOverdueTasks([]);
    }
  };

  const fetchMyTasks = async () => {
    try {
      const response = await lecturerService.getMyTasks();
      setMyTasks(response.data.data || []);
    } catch {
      // Silent fail for my tasks
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchMyTasks();
  }, []);

  const handleProjectChange = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project);
    setSelectedTeam(null);
    setKanbanData({ TODO: [], DOING: [], DONE: [] });
    
    if (project) {
      await fetchTeamsByProject(projectId);
    }
  };

  const handleTeamChange = async (teamId) => {
    const team = teams.find(t => t.id === teamId);
    setSelectedTeam(team);
    
    if (team) {
      await fetchKanbanBoard(teamId);
      await fetchOverdueTasks(teamId);
    }
  };

  const handleCreateTask = async (values) => {
    try {
      const data = {
        ...values,
        teamId: selectedTeam.id,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null
      };
      await lecturerService.createTask(data);
      message.success('Tạo task thành công');
      setCreateModal(false);
      createForm.resetFields();
      
      if (selectedTeam) {
        await fetchKanbanBoard(selectedTeam.id);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Tạo task thất bại');
    }
  };

  const handleUpdateTask = async (values) => {
    try {
      const data = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null
      };
      await lecturerService.updateTask(selectedTask.id, data);
      message.success('Cập nhật task thành công');
      setEditModal(false);
      editForm.resetFields();
      
      if (selectedTeam) {
        await fetchKanbanBoard(selectedTeam.id);
      }
    } catch {
      message.error('Cập nhật task thất bại');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await lecturerService.updateTaskStatus(taskId, newStatus);
      message.success('Cập nhật trạng thái thành công');
      
      if (selectedTeam) {
        await fetchKanbanBoard(selectedTeam.id);
      }
    } catch {
      message.error('Cập nhật trạng thái thất bại');
    }
  };

  const handleAssignTask = async (taskId, assigneeId) => {
    try {
      await lecturerService.assignTask(taskId, assigneeId);
      message.success('Gán task thành công');
      
      if (selectedTeam) {
        await fetchKanbanBoard(selectedTeam.id);
      }
    } catch {
      message.error('Gán task thất bại');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await lecturerService.deleteTask(taskId);
      message.success('Xóa task thành công');
      
      if (selectedTeam) {
        await fetchKanbanBoard(selectedTeam.id);
      }
    } catch {
      message.error('Xóa task thất bại');
    }
  };

  const handleViewTask = async (task) => {
    try {
      const response = await lecturerService.getTaskById(task.id);
      setSelectedTask(response.data.data);
      setTaskDetailDrawer(true);
    } catch {
      message.error('Không thể tải thông tin task');
    }
  };

  const getStatusColor = (status) => {
    const colors = { TODO: 'default', DOING: 'processing', DONE: 'success' };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = { 1: 'green', 2: 'orange', 3: 'red' };
    return colors[priority] || 'default';
  };

  const getPriorityText = (priority) => {
    const texts = { 1: 'Thấp', 2: 'Trung bình', 3: 'Cao' };
    return texts[priority] || 'Không xác định';
  };

  const isOverdue = (dueDate) => {
    return dueDate && dayjs(dueDate).isBefore(dayjs());
  };

  const renderTaskCard = (task) => (
    <Card
      key={task.id}
      size="small"
      style={{ 
        marginBottom: '8px',
        cursor: 'pointer',
        borderLeft: `4px solid ${isOverdue(task.dueDate) ? '#ff4d4f' : '#1890ff'}`
      }}
      onClick={() => handleViewTask(task)}
      hoverable
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Text strong>{task.title}</Text>
        <Space wrap>
          <Tag color={getPriorityColor(task.priority)}>
            {getPriorityText(task.priority)}
          </Tag>
          {task.assignee && (
            <Tag icon={<UserOutlined />}>
              {task.assignee.fullName}
            </Tag>
          )}
          {task.dueDate && (
            <Tag 
              icon={<ClockCircleOutlined />}
              color={isOverdue(task.dueDate) ? 'error' : 'default'}
            >
              {dayjs(task.dueDate).format('DD/MM')}
            </Tag>
          )}
        </Space>
      </Space>
    </Card>
  );

  const renderKanbanColumn = (status, title, tasks) => (
    <Col span={8} key={status}>
      <Card
        title={
          <Space>
            <span>{title}</span>
            <Badge count={tasks.length} style={{ backgroundColor: '#52c41a' }} />
          </Space>
        }
        style={{ height: '600px', overflow: 'auto' }}
      >
        {tasks.length > 0 ? (
          tasks.map(task => renderTaskCard(task))
        ) : (
          <Empty description="Chưa có task" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>
    </Col>
  );

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>
          <CheckSquareOutlined /> Quản lý công việc
        </Title>
      </div>

      {/* Selection Cards */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ marginRight: '8px' }}>Chọn dự án:</Text>
                <Select
                  style={{ width: '100%', maxWidth: '400px' }}
                  placeholder="Chọn dự án"
                  onChange={handleProjectChange}
                  value={selectedProject?.id}
                >
                  {projects.map(project => (
                    <Select.Option key={project.id} value={project.id}>
                      {project.title}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              {selectedProject && (
                <div>
                  <Text strong style={{ marginRight: '8px' }}>Chọn nhóm:</Text>
                  <Select
                    style={{ width: '100%', maxWidth: '400px' }}
                    placeholder="Chọn nhóm"
                    onChange={handleTeamChange}
                    value={selectedTeam?.id}
                  >
                    {teams.map(team => (
                      <Select.Option key={team.id} value={team.id}>
                        {team.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}
            </Space>
          </Col>
          {selectedTeam && (
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModal(true)}
                >
                  Tạo task
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchKanbanBoard(selectedTeam.id)}
                >
                  Làm mới
                </Button>
              </Space>
            </Col>
          )}
        </Row>
      </Card>

      {/* Statistics */}
      {selectedTeam && (
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="TODO"
                value={kanbanData.TODO?.length || 0}
                valueStyle={{ color: '#8c8c8c' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="DOING"
                value={kanbanData.DOING?.length || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="DONE"
                value={kanbanData.DONE?.length || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Quá hạn"
                value={overdueTasks.length}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Kanban Board" key="kanban">
            {selectedTeam ? (
              <Row gutter={16}>
                {renderKanbanColumn('TODO', 'TODO', kanbanData.TODO || [])}
                {renderKanbanColumn('DOING', 'DOING', kanbanData.DOING || [])}
                {renderKanbanColumn('DONE', 'DONE', kanbanData.DONE || [])}
              </Row>
            ) : (
              <Empty description="Vui lòng chọn nhóm để xem Kanban board" />
            )}
          </Tabs.TabPane>

          <Tabs.TabPane tab="Tasks quá hạn" key="overdue">
            {selectedTeam ? (
              <List
                dataSource={overdueTasks}
                locale={{ emptyText: 'Không có task quá hạn' }}
                renderItem={(task) => (
                  <List.Item
                    actions={[
                      <Button
                        key="view"
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewTask(task)}
                      >
                        Xem
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<WarningOutlined />} style={{ backgroundColor: '#ff4d4f' }} />}
                      title={task.title}
                      description={
                        <Space>
                          <Tag color={getStatusColor(task.status)}>{task.status}</Tag>
                          <Text type="danger">
                            Hạn: {dayjs(task.dueDate).format('DD/MM/YYYY')}
                          </Text>
                          {task.assignee && <Text>Người làm: {task.assignee.fullName}</Text>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Vui lòng chọn nhóm" />
            )}
          </Tabs.TabPane>

          <Tabs.TabPane tab="Tasks của tôi" key="mytasks">
            <List
              dataSource={myTasks}
              locale={{ emptyText: 'Bạn chưa có task nào' }}
              renderItem={(task) => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewTask(task)}
                    >
                      Xem
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<CheckSquareOutlined />} />}
                    title={task.title}
                    description={
                      <Space>
                        <Tag color={getStatusColor(task.status)}>{task.status}</Tag>
                        <Tag color={getPriorityColor(task.priority)}>
                          {getPriorityText(task.priority)}
                        </Tag>
                        {task.team && <Tag icon={<TeamOutlined />}>{task.team.name}</Tag>}
                        {task.dueDate && (
                          <Text type={isOverdue(task.dueDate) ? 'danger' : 'secondary'}>
                            {dayjs(task.dueDate).format('DD/MM/YYYY')}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* Create Task Modal */}
      <Modal
        title="Tạo task mới"
        open={createModal}
        onCancel={() => {
          setCreateModal(false);
          createForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateTask}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Ví dụ: Thiết kế database" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Mô tả chi tiết task" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Độ ưu tiên"
                rules={[{ required: true, message: 'Chọn độ ưu tiên' }]}
              >
                <Select placeholder="Chọn độ ưu tiên">
                  <Select.Option value={1}>Thấp</Select.Option>
                  <Select.Option value={2}>Trung bình</Select.Option>
                  <Select.Option value={3}>Cao</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Hạn hoàn thành"
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  showTime
                  format="DD/MM/YYYY HH:mm"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="assigneeId"
            label="Gán cho"
          >
            <Select placeholder="Chọn người làm" allowClear>
              {selectedTeam?.members?.map(member => (
                <Select.Option key={member.id} value={member.id}>
                  {member.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Tạo task
              </Button>
              <Button onClick={() => {
                setCreateModal(false);
                createForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        title="Cập nhật task"
        open={editModal}
        onCancel={() => {
          setEditModal(false);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateTask}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Độ ưu tiên"
              >
                <Select>
                  <Select.Option value={1}>Thấp</Select.Option>
                  <Select.Option value={2}>Trung bình</Select.Option>
                  <Select.Option value={3}>Cao</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Hạn hoàn thành"
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  showTime
                  format="DD/MM/YYYY HH:mm"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button onClick={() => {
                setEditModal(false);
                editForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Task Detail Drawer */}
      <Drawer
        title="Chi tiết task"
        open={taskDetailDrawer}
        onClose={() => {
          setTaskDetailDrawer(false);
          setSelectedTask(null);
        }}
        width={500}
      >
        {selectedTask && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card size="small">
              <Title level={4}>{selectedTask.title}</Title>
              <Text type="secondary">{selectedTask.description}</Text>
            </Card>

            <Card size="small" title="Thông tin">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Trạng thái: </Text>
                  <Select
                    value={selectedTask.status}
                    style={{ width: '150px', marginLeft: '8px' }}
                    onChange={(value) => handleUpdateStatus(selectedTask.id, value)}
                  >
                    <Select.Option value="TODO">TODO</Select.Option>
                    <Select.Option value="DOING">DOING</Select.Option>
                    <Select.Option value="DONE">DONE</Select.Option>
                  </Select>
                </div>
                <div>
                  <Text strong>Độ ưu tiên: </Text>
                  <Tag color={getPriorityColor(selectedTask.priority)}>
                    {getPriorityText(selectedTask.priority)}
                  </Tag>
                </div>
                <div>
                  <Text strong>Người làm: </Text>
                  <Select
                    value={selectedTask.assignee?.id}
                    style={{ width: '200px', marginLeft: '8px' }}
                    onChange={(value) => handleAssignTask(selectedTask.id, value)}
                    allowClear
                  >
                    {selectedTeam?.members?.map(member => (
                      <Select.Option key={member.id} value={member.id}>
                        {member.fullName}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                {selectedTask.dueDate && (
                  <div>
                    <Text strong>Hạn: </Text>
                    <Text type={isOverdue(selectedTask.dueDate) ? 'danger' : 'secondary'}>
                      {dayjs(selectedTask.dueDate).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </div>
                )}
                {selectedTask.team && (
                  <div>
                    <Text strong>Nhóm: </Text>
                    <Tag icon={<TeamOutlined />}>{selectedTask.team.name}</Tag>
                  </div>
                )}
              </Space>
            </Card>

            {isOverdue(selectedTask.dueDate) && (
              <Alert
                message="Task đã quá hạn"
                type="error"
                showIcon
                icon={<WarningOutlined />}
              />
            )}

            <Space>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  editForm.setFieldsValue({
                    title: selectedTask.title,
                    description: selectedTask.description,
                    priority: selectedTask.priority,
                    dueDate: selectedTask.dueDate ? dayjs(selectedTask.dueDate) : null
                  });
                  setEditModal(true);
                  setTaskDetailDrawer(false);
                }}
              >
                Sửa
              </Button>
              <Popconfirm
                title="Xóa task này?"
                onConfirm={() => {
                  handleDeleteTask(selectedTask.id);
                  setTaskDetailDrawer(false);
                }}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            </Space>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default TaskManagement;
