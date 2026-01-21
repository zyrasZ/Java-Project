import { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Modal, Form, Input, message, Space, Tag, 
  Select, DatePicker, Typography, Drawer, List, Divider
} from 'antd';
import { 
  PlusOutlined, ProjectOutlined, SendOutlined, EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import lecturerService from '../../services/lecturerService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [milestoneDrawer, setMilestoneDrawer] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [form] = Form.useForm();
  const [milestoneForm] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, classesRes] = await Promise.all([
        lecturerService.getMyProjects(),
        lecturerService.getMyClasses()
      ]);
      setProjects(projectsRes.data.data || []);
      setClasses(classesRes.data.data || []);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    try {
      const data = {
        ...values,
        deadline: values.deadline.toISOString()
      };
      await lecturerService.createProject(data);
      message.success('Tạo dự án thành công');
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Tạo dự án thất bại');
    }
  };

  const handleSubmitProject = async (projectId) => {
    try {
      await lecturerService.submitProject(projectId);
      message.success('Gửi dự án để duyệt thành công');
      fetchData();
    } catch (error) {
      message.error('Gửi dự án thất bại');
    }
  };

  const handleViewMilestones = async (project) => {
    try {
      setSelectedProject(project);
      const response = await lecturerService.getMilestones(project.id);
      setMilestones(response.data.data || []);
      setMilestoneDrawer(true);
    } catch (error) {
      message.error('Không thể tải milestones');
    }
  };

  const handleCreateMilestone = async (values) => {
    try {
      const data = {
        ...values,
        dueDate: values.dueDate.toISOString()
      };
      await lecturerService.createMilestone(selectedProject.id, data);
      message.success('Tạo milestone thành công');
      milestoneForm.resetFields();
      handleViewMilestones(selectedProject);
    } catch (error) {
      message.error('Tạo milestone thất bại');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'default',
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'error'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Tên dự án',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Lớp học',
      dataIndex: ['classRoom', 'name'],
      key: 'classroom',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'DRAFT' && (
            <Button
              type="link"
              icon={<SendOutlined />}
              onClick={() => handleSubmitProject(record.id)}
            >
              Gửi duyệt
            </Button>
          )}
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewMilestones(record)}
          >
            Milestones
          </Button>
          <Button
            type="link"
            onClick={() => navigate(`/lecturer/projects/${record.id}`)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>
          <ProjectOutlined /> Quản lý dự án
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Tạo dự án
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={projects}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create Project Modal */}
      <Modal
        title="Tạo dự án mới"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="title"
            label="Tên dự án"
            rules={[{ required: true, message: 'Vui lòng nhập tên dự án' }]}
          >
            <Input placeholder="Ví dụ: Website Thương mại điện tử" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={4} placeholder="Mô tả chi tiết về dự án" />
          </Form.Item>
          <Form.Item
            name="classroomId"
            label="Lớp học"
            rules={[{ required: true, message: 'Vui lòng chọn lớp học' }]}
          >
            <Select placeholder="Chọn lớp học">
              {classes.map(cls => (
                <Select.Option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.code})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="deadline"
            label="Deadline"
            rules={[{ required: true, message: 'Vui lòng chọn deadline' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              showTime
              format="DD/MM/YYYY HH:mm"
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Tạo
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Milestones Drawer */}
      <Drawer
        title={`Milestones - ${selectedProject?.title}`}
        open={milestoneDrawer}
        onClose={() => setMilestoneDrawer(false)}
        width={500}
      >
        <Form
          form={milestoneForm}
          layout="vertical"
          onFinish={handleCreateMilestone}
        >
          <Card title="Thêm Milestone mới" size="small" style={{ marginBottom: '16px' }}>
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
            >
              <Input placeholder="Ví dụ: Phase 1 - UI Design" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Mô tả"
            >
              <TextArea rows={2} placeholder="Mô tả milestone" />
            </Form.Item>
            <Form.Item
              name="dueDate"
              label="Ngày hết hạn"
              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                showTime
                format="DD/MM/YYYY HH:mm"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Thêm Milestone
              </Button>
            </Form.Item>
          </Card>
        </Form>

        <Divider>Danh sách Milestones</Divider>
        <List
          dataSource={milestones}
          locale={{ emptyText: 'Chưa có milestone nào' }}
          renderItem={(milestone) => (
            <List.Item>
              <List.Item.Meta
                title={milestone.title}
                description={
                  <>
                    <Text type="secondary">{milestone.description}</Text>
                    <br />
                    <Text type="secondary">
                      Hạn: {dayjs(milestone.dueDate).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  );
};

export default ProjectManagement;
