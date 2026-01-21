import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Input, Select, DatePicker, Tag, Spin, message, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import studentService from '../../services/studentService';
import dayjs from 'dayjs';

const { TextArea } = Input;

const MyTasks = () => {
  const [loading, setLoading] = useState(true);
  const [kanbanData, setKanbanData] = useState({ TODO: [], DOING: [], DONE: [] });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchKanbanData();
    }
  }, [selectedTeam]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const teamsData = await studentService.getMyTeams();
      const teamsArray = Array.isArray(teamsData) ? teamsData : [];
      
      setTeams(teamsArray);
      
      if (teamsArray.length > 0) {
        setSelectedTeam(teamsArray[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchKanbanData = async () => {
    try {
      const data = await studentService.getKanbanBoard(selectedTeam);
      setKanbanData(data || { TODO: [], DOING: [], DONE: [] });
    } catch (error) {
      console.error('Error fetching kanban data:', error);
      message.error('Không thể tải công việc');
    }
  };

  const handleCreateTask = async (values) => {
    try {
      setSubmitting(true);
      await studentService.createTask({
        ...values,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
        teamId: selectedTeam
      });
      message.success('Tạo công việc thành công');
      setShowTaskModal(false);
      form.resetFields();
      fetchKanbanData();
    } catch (error) {
      console.error('Error creating task:', error);
      message.error('Không thể tạo công việc');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTask = async (values) => {
    try {
      setSubmitting(true);
      await studentService.updateTask(editingTask.id, {
        ...values,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null
      });
      message.success('Cập nhật công việc thành công');
      setShowTaskModal(false);
      setEditingTask(null);
      form.resetFields();
      fetchKanbanData();
    } catch (error) {
      console.error('Error updating task:', error);
      message.error('Không thể cập nhật công việc');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    Modal.confirm({
      title: 'Xóa công việc',
      content: 'Bạn có chắc chắn muốn xóa công việc này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await studentService.deleteTask(taskId);
          message.success('Xóa công việc thành công');
          fetchKanbanData();
        } catch (error) {
          console.error('Error deleting task:', error);
          message.error('Không thể xóa công việc');
        }
      }
    });
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await studentService.updateTaskStatus(taskId, newStatus);
      message.success('Cập nhật trạng thái thành công');
      fetchKanbanData();
    } catch (error) {
      console.error('Error updating task status:', error);
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    form.setFieldsValue({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 1,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null
    });
    setShowTaskModal(true);
  };

  const getPriorityColor = (priority) => {
    if (priority >= 3) return 'red';
    if (priority === 2) return 'orange';
    return 'green';
  };

  const renderColumn = (status, title, tasks) => (
    <Card title={`${title} (${tasks.length})`} style={{ height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '400px' }}>
        {tasks.map((task) => (
          <Card
            key={task.id}
            size="small"
            style={{ borderLeft: `4px solid ${status === 'TODO' ? '#d9d9d9' : status === 'DOING' ? '#1890ff' : '#52c41a'}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong>{task.title}</strong>
              <div style={{ display: 'flex', gap: '4px' }}>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(task)}
                />
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteTask(task.id)}
                />
              </div>
            </div>
            
            {task.description && (
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                {task.description}
              </p>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <Tag color={getPriorityColor(task.priority)}>P{task.priority}</Tag>
              {task.assignee && (
                <span style={{ fontSize: '12px', color: '#666' }}>{task.assignee.fullName}</span>
              )}
            </div>

            {status !== 'DONE' && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                {status === 'TODO' && (
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => handleStatusChange(task.id, 'DOING')}
                    block
                  >
                    Bắt đầu
                  </Button>
                )}
                {status === 'DOING' && (
                  <>
                    <Button
                      size="small"
                      onClick={() => handleStatusChange(task.id, 'TODO')}
                    >
                      Quay lại
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      style={{ backgroundColor: '#52c41a' }}
                      onClick={() => handleStatusChange(task.id, 'DONE')}
                    >
                      Hoàn thành
                    </Button>
                  </>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </Card>
  );

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

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#262626' }}>
          Công việc của tôi
        </h1>
        <p style={{ color: '#8c8c8c' }}>Quản lý công việc nhóm</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <Select
          value={selectedTeam}
          onChange={setSelectedTeam}
          style={{ minWidth: '200px' }}
          size="large"
        >
          {teams.map((team) => (
            <Select.Option key={team.id} value={team.id}>
              {team.name}
            </Select.Option>
          ))}
        </Select>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => {
            setEditingTask(null);
            form.resetFields();
            setShowTaskModal(true);
          }}
        >
          Tạo công việc
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          {renderColumn('TODO', 'Cần làm', kanbanData.TODO || [])}
        </Col>
        <Col xs={24} md={8}>
          {renderColumn('DOING', 'Đang làm', kanbanData.DOING || [])}
        </Col>
        <Col xs={24} md={8}>
          {renderColumn('DONE', 'Hoàn thành', kanbanData.DONE || [])}
        </Col>
      </Row>

      <Modal
        title={editingTask ? 'Sửa công việc' : 'Tạo công việc mới'}
        open={showTaskModal}
        onCancel={() => {
          setShowTaskModal(false);
          setEditingTask(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingTask ? handleUpdateTask : handleCreateTask}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề công việc" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Nhập mô tả công việc" />
          </Form.Item>

          <Form.Item name="priority" label="Độ ưu tiên" initialValue={1}>
            <Select>
              <Select.Option value={1}>Thấp (1)</Select.Option>
              <Select.Option value={2}>Trung bình (2)</Select.Option>
              <Select.Option value={3}>Cao (3)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="dueDate" label="Hạn hoàn thành">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setShowTaskModal(false);
                  setEditingTask(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingTask ? 'Cập nhật' : 'Tạo'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyTasks;
