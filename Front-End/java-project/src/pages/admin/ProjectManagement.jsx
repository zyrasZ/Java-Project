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
  DatePicker,
  Tabs,
  App,
  Descriptions,
  Badge,
  List,
  Divider,
  Timeline,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  SendOutlined,
  ProjectOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  FlagOutlined
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import { AuthContext } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

const ProjectManagement = () => {
  const { message } = App.useApp();
  const { user } = useContext(AuthContext);
  const [allProjects, setAllProjects] = useState([]);
  const [approvedProjects, setApprovedProjects] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [milestoneModalVisible, setMilestoneModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('approved');
  const [createForm] = Form.useForm();
  const [milestoneForm] = Form.useForm();
  const [rejectForm] = Form.useForm();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchApprovedProjects(),
      fetchPendingProjects(),
      fetchMyProjects(),
      fetchClasses()
    ]);
  };

  const fetchApprovedProjects = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllProjects();
      if (response && response.status === 'success') {
        setApprovedProjects(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching approved projects:', err);
      setApprovedProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingProjects = async () => {
    try {
      const response = await adminService.getPendingProjects();
      if (response && response.status === 'success') {
        setPendingProjects(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching pending projects:', err);
      setPendingProjects([]);
    }
  };

  const fetchMyProjects = async () => {
    try {
      const response = await adminService.getMyProjects();
      if (response && response.status === 'success') {
        setMyProjects(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching my projects:', err);
      setMyProjects([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await adminService.getAllClasses();
      if (response && response.status === 'success') {
        setClasses(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setClasses([]);
    }
  };

  const fetchProjectMilestones = async (projectId) => {
    try {
      const response = await adminService.getProjectMilestones(projectId);
      if (response && response.status === 'success') {
        setMilestones(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching milestones:', err);
      setMilestones([]);
    }
  };

  const handleCreateProject = async (values) => {
    try {
      const projectData = {
        title: values.title,
        description: values.description,
        deadline: values.deadline.format('YYYY-MM-DDTHH:mm:ss'),
        classroomId: values.classroomId
      };

      const response = await adminService.createProject(projectData);
      if (response && response.status === 'success') {
        message.success('Tạo dự án thành công');
        fetchAllData();
        setCreateModalVisible(false);
        createForm.resetFields();
      }
    } catch (err) {
      console.error('Error creating project:', err);
      message.error(err.response?.data?.message || 'Tạo dự án thất bại');
    }
  };

  const handleSubmitProject = async (projectId) => {
    try {
      const response = await adminService.submitProject(projectId);
      if (response && response.status === 'success') {
        message.success('Gửi dự án để phê duyệt thành công');
        fetchAllData();
      }
    } catch (err) {
      console.error('Error submitting project:', err);
      message.error(err.response?.data?.message || 'Gửi dự án thất bại');
    }
  };

  const handleApproveProject = async (projectId, comment = '') => {
    try {
      const response = await adminService.approveProject(projectId, comment);
      if (response && response.status === 'success') {
        message.success('Phê duyệt dự án thành công');
        fetchAllData();
      }
    } catch (err) {
      console.error('Error approving project:', err);
      message.error(err.response?.data?.message || 'Phê duyệt dự án thất bại');
    }
  };

  const handleRejectProject = async (values) => {
    try {
      const response = await adminService.rejectProject(selectedProject.id, values.reason);
      if (response && response.status === 'success') {
        message.success('Từ chối dự án thành công');
        fetchAllData();
        setRejectModalVisible(false);
        rejectForm.resetFields();
      }
    } catch (err) {
      console.error('Error rejecting project:', err);
      message.error(err.response?.data?.message || 'Từ chối dự án thất bại');
    }
  };

  const handleCreateMilestone = async (values) => {
    try {
      const milestoneData = {
        title: values.title,
        description: values.description,
        dueDate: values.dueDate.format('YYYY-MM-DDTHH:mm:ss')
      };

      const response = await adminService.createMilestone(selectedProject.id, milestoneData);
      if (response && response.status === 'success') {
        message.success('Tạo milestone thành công');
        fetchProjectMilestones(selectedProject.id);
        milestoneForm.resetFields();
      }
    } catch (err) {
      console.error('Error creating milestone:', err);
      message.error(err.response?.data?.message || 'Tạo milestone thất bại');
    }
  };

  const handleViewDetails = async (project) => {
    setSelectedProject(project);
    await fetchProjectMilestones(project.id);
    setDetailModalVisible(true);
  };

  const handleShowRejectModal = (project) => {
    setSelectedProject(project);
    setRejectModalVisible(true);
  };

  const handleShowMilestoneModal = (project) => {
    setSelectedProject(project);
    setMilestoneModalVisible(true);
  };

  // Filter projects based on search text
  const filterProjects = (projectList) => {
    return projectList.filter(project => {
      const searchLower = searchText.toLowerCase();
      const title = project.title?.toLowerCase() || '';
      const description = project.description?.toLowerCase() || '';
      const className = project.classRoom?.name?.toLowerCase() || '';
      
      return title.includes(searchLower) || 
             description.includes(searchLower) || 
             className.includes(searchLower);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'orange';
      case 'APPROVED': return 'green';
      case 'REJECTED': return 'red';
      case 'DRAFT': return 'blue';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ phê duyệt';
      case 'APPROVED': return 'Đã phê duyệt';
      case 'REJECTED': return 'Bị từ chối';
      case 'DRAFT': return 'Bản nháp';
      default: return status;
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'approved': return filterProjects(approvedProjects);
      case 'pending': return filterProjects(pendingProjects);
      case 'my': return filterProjects(myProjects);
      default: return [];
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Tên dự án',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
            {record.description?.substring(0, 50)}...
          </div>
        </div>
      ),
    },
    {
      title: 'Lớp học',
      key: 'classroom',
      ellipsis: true,
      render: (_, record) => (
        <div>
          <div>{record.classRoom?.name || 'N/A'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.classRoom?.code || ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Giảng viên',
      key: 'lecturer',
      ellipsis: true,
      render: (_, record) => {
        const lecturer = record.classRoom?.lecturer;
        return lecturer?.fullName || lecturer?.full_name || 'N/A';
      },
    },
    {
      title: 'Deadline',
      key: 'deadline',
      render: (_, record) => {
        if (record.deadline) {
          const deadline = dayjs(record.deadline);
          const isOverdue = deadline.isBefore(dayjs());
          return (
            <div style={{ color: isOverdue ? '#ff4d4f' : '#666' }}>
              <CalendarOutlined style={{ marginRight: '4px' }} />
              {deadline.format('DD/MM/YYYY')}
              {isOverdue && <div style={{ fontSize: '11px' }}>Quá hạn</div>}
            </div>
          );
        }
        return 'N/A';
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusText(record.status)}
        </Tag>
      ),
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
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          
          {/* Actions for DRAFT projects */}
          {record.status === 'DRAFT' && (
            <Tooltip title="Gửi để phê duyệt">
              <Popconfirm
                title="Gửi dự án để phê duyệt?"
                onConfirm={() => handleSubmitProject(record.id)}
                okText="Gửi"
                cancelText="Hủy"
              >
                <Button
                  size="small"
                  type="primary"
                  icon={<SendOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          )}

          {/* Actions for PENDING projects (Admin/Head Department only) */}
          {record.status === 'PENDING' && (user?.role === 'ADMIN' || user?.role === 'HEAD_DEPARTMENT') && (
            <>
              <Tooltip title="Phê duyệt">
                <Popconfirm
                  title="Phê duyệt dự án này?"
                  onConfirm={() => handleApproveProject(record.id)}
                  okText="Phê duyệt"
                  cancelText="Hủy"
                >
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckOutlined />}
                  />
                </Popconfirm>
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleShowRejectModal(record)}
                />
              </Tooltip>
            </>
          )}

          {/* Actions for APPROVED projects */}
          {record.status === 'APPROVED' && (
            <Tooltip title="Thêm milestone">
              <Button
                size="small"
                type="dashed"
                icon={<FlagOutlined />}
                onClick={() => handleShowMilestoneModal(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'approved',
      label: (
        <span>
          <CheckOutlined />
          Đã phê duyệt ({approvedProjects.length})
        </span>
      ),
    },
    {
      key: 'pending',
      label: (
        <span>
          <ClockCircleOutlined />
          Chờ phê duyệt ({pendingProjects.length})
        </span>
      ),
    },
    {
      key: 'my',
      label: (
        <span>
          <UserOutlined />
          Dự án của tôi ({myProjects.length})
        </span>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        <ProjectOutlined style={{ marginRight: '8px' }} />
        Quản lý dự án
      </Title>

      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm theo tên dự án, mô tả hoặc lớp học"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={16}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                Tạo dự án mới
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchAllData}
              >
                Làm mới
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
        />

        <div style={{ marginBottom: '16px' }}>
          <Tag color="blue">
            Hiển thị: {getCurrentData().length} dự án
          </Tag>
          <Tag color="green">
            Đã phê duyệt: {approvedProjects.length}
          </Tag>
          <Tag color="orange">
            Chờ phê duyệt: {pendingProjects.length}
          </Tag>
          <Tag color="purple">
            Của tôi: {myProjects.length}
          </Tag>
        </div>

        <Table
          columns={columns}
          dataSource={getCurrentData()}
          rowKey={(record) => record.id}
          loading={loading}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: searchText ? 'Không tìm thấy dự án nào' : 'Chưa có dự án nào'
          }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} dự án`,
            pageSizeOptions: ['10', '20', '50'],
            defaultPageSize: 10
          }}
        />
      </Card>

      {/* Create Project Modal */}
      <Modal
        title="Tạo dự án mới"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateProject}
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
            label="Mô tả dự án"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả dự án' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Xây dựng website bán hàng online với đầy đủ chức năng..."
            />
          </Form.Item>

          <Form.Item
            name="classroomId"
            label="Lớp học"
            rules={[{ required: true, message: 'Vui lòng chọn lớp học' }]}
          >
            <Select
              placeholder="Chọn lớp học"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {classes.map(cls => (
                <Select.Option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.code}) - {cls.lecturer?.fullName || cls.lecturer?.full_name}
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
              format="DD/MM/YYYY HH:mm"
              showTime={{ format: 'HH:mm' }}
              placeholder="Chọn ngày và giờ deadline"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCreateModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo dự án
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Project Detail Modal */}
      <Modal
        title={`Chi tiết dự án: ${selectedProject?.title}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedProject && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="ID" span={1}>
                {selectedProject.id}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                <Badge 
                  status={selectedProject.status === 'APPROVED' ? 'success' : 
                         selectedProject.status === 'PENDING' ? 'processing' : 
                         selectedProject.status === 'DRAFT' ? 'default' : 'error'} 
                  text={getStatusText(selectedProject.status)} 
                />
              </Descriptions.Item>
              <Descriptions.Item label="Tên dự án" span={2}>
                {selectedProject.title}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {selectedProject.description}
              </Descriptions.Item>
              <Descriptions.Item label="Lớp học" span={1}>
                {selectedProject.classRoom?.name} ({selectedProject.classRoom?.code})
              </Descriptions.Item>
              <Descriptions.Item label="Giảng viên" span={1}>
                {selectedProject.classRoom?.lecturer?.fullName || 
                 selectedProject.classRoom?.lecturer?.full_name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Deadline" span={1}>
                {selectedProject.deadline ? 
                  dayjs(selectedProject.deadline).format('DD/MM/YYYY HH:mm') : 
                  'N/A'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" span={1}>
                {selectedProject.createdAt ? 
                  dayjs(selectedProject.createdAt).format('DD/MM/YYYY HH:mm') : 
                  'N/A'
                }
              </Descriptions.Item>
              {selectedProject.rejectionReason && (
                <Descriptions.Item label="Lý do từ chối" span={2}>
                  <div style={{ color: '#ff4d4f' }}>
                    {selectedProject.rejectionReason}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider>Milestones</Divider>
            {milestones.length > 0 ? (
              <Timeline
                items={milestones.map(milestone => ({
                  color: dayjs(milestone.dueDate).isBefore(dayjs()) ? 'red' : 'blue',
                  children: (
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{milestone.title}</div>
                      <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                        {milestone.description}
                      </div>
                      <div style={{ color: '#999', fontSize: '11px', marginTop: '2px' }}>
                        <CalendarOutlined style={{ marginRight: '4px' }} />
                        {dayjs(milestone.dueDate).format('DD/MM/YYYY HH:mm')}
                      </div>
                    </div>
                  )
                }))}
              />
            ) : (
              <Empty 
                description="Chưa có milestone nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Reject Project Modal */}
      <Modal
        title="Từ chối dự án"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectProject}
        >
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Ví dụ: Đề tài chưa rõ ràng, cần bổ sung mô tả chi tiết..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setRejectModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" danger htmlType="submit">
                Từ chối dự án
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Milestone Modal */}
      <Modal
        title={`Thêm milestone cho: ${selectedProject?.title}`}
        open={milestoneModalVisible}
        onCancel={() => setMilestoneModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={milestoneForm}
          layout="vertical"
          onFinish={handleCreateMilestone}
        >
          <Form.Item
            name="title"
            label="Tên milestone"
            rules={[{ required: true, message: 'Vui lòng nhập tên milestone' }]}
          >
            <Input placeholder="Ví dụ: Phase 1: Thiết kế UI/UX" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả milestone' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Hoàn thành thiết kế giao diện người dùng..."
            />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Ngày hết hạn"
            rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="DD/MM/YYYY HH:mm"
              showTime={{ format: 'HH:mm' }}
              placeholder="Chọn ngày và giờ hết hạn"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setMilestoneModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo milestone
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectManagement;