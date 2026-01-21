import { useState, useEffect } from 'react';
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
  App
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';

const { Title } = Typography;

const ClassManagement = () => {
  const { message } = App.useApp();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching classes...');
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('👤 Current user:', currentUser);
      
      let response;
      
      if (currentUser.role === 'ADMIN') {
        console.log('🔗 Using ADMIN endpoint: /admin/classes/all');
        response = await adminService.getAllClassesAll();
      } else {
        console.log('🔗 Using LECTURER endpoint: /admin/classes');
        response = await adminService.getMyClasses();
      }
      
      console.log('📦 API response:', response);
      
      if (response && response.status === 'success') {
        const classesData = response.data || [];
        console.log('✅ Classes data:', classesData);
        setClasses(classesData);
      } else {
        console.log('❌ No success status or no data');
        setClasses([]);
      }
    } catch (err) {
      console.error('💥 Error fetching classes:', err);
      console.error('💥 Error response:', err.response?.data);
      message.error('Không thể tải danh sách lớp học');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingClass(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingClass) {
        const response = await adminService.updateClass(editingClass.id, values);
        if (response && response.status === 'success') {
          message.success('Cập nhật lớp học thành công');
          fetchClasses();
          setModalVisible(false);
        }
      } else {
        const response = await adminService.createClass(values);
        if (response && response.status === 'success') {
          message.success('Tạo lớp học thành công');
          fetchClasses();
          setModalVisible(false);
        }
      }
    } catch (err) {
      console.error('Error submitting class:', err);
      message.error(editingClass ? 'Cập nhật thất bại' : 'Tạo lớp học thất bại');
    }
  };

  const handleDelete = async (classId) => {
    try {
      const response = await adminService.deleteClass(classId);
      if (response && response.status === 'success') {
        message.success('Xóa lớp học thành công');
        fetchClasses();
      }
    } catch (err) {
      console.error('Error deleting class:', err);
      message.error('Xóa lớp học thất bại');
    }
  };

  // Filter classes based on search text
  const filteredClasses = classes.filter(classItem => {
    const searchLower = searchText.toLowerCase();
    const name = classItem.name?.toLowerCase() || '';
    const code = classItem.code?.toLowerCase() || '';
    const lecturerName = classItem.lecturer?.fullName?.toLowerCase() || 
                        classItem.lecturer?.full_name?.toLowerCase() || 
                        classItem.lecturerName?.toLowerCase() || 
                        classItem.lecturer_name?.toLowerCase() || '';
    
    return name.includes(searchLower) || 
           code.includes(searchLower) || 
           lecturerName.includes(searchLower);
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Tên lớp',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Mã lớp',
      dataIndex: 'code',
      key: 'code',
      ellipsis: true,
    },
    {
      title: 'Giảng viên',
      key: 'lecturer',
      ellipsis: true,
      render: (_, record) => {
        // Handle different possible structures
        if (record.lecturer?.fullName) {
          return record.lecturer.fullName;
        } else if (record.lecturer?.full_name) {
          return record.lecturer.full_name;
        } else if (record.lecturerName) {
          return record.lecturerName;
        } else if (record.lecturer_name) {
          return record.lecturer_name;
        } else {
          return `ID: ${record.lecturer_id || record.lecturerId || 'N/A'}`;
        }
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingClass(record);
                form.setFieldsValue({
                  name: record.name,
                  code: record.code,
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa lớp học này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Quản lý lớp học</Title>

      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm theo tên lớp, mã lớp hoặc giảng viên"
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
                onClick={handleCreate}
              >
                Tạo lớp học mới
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchClasses}
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
            Tổng số lớp học: {filteredClasses.length}
          </Tag>
        </div>

        <Table
          columns={columns}
          dataSource={filteredClasses}
          rowKey={(record) => record.id || record.code}
          loading={loading}
          scroll={{ x: 800 }}
          locale={{
            emptyText: searchText ? 'Không tìm thấy lớp học nào' : 'Chưa có lớp học nào'
          }}
        />
      </Card>

      {/* Create/Edit Class Modal */}
      <Modal
        title={editingClass ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên lớp học"
            rules={[{ required: true, message: 'Vui lòng nhập tên lớp học' }]}
          >
            <Input placeholder="Ví dụ: Lập trình Web" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã lớp"
            rules={[{ required: true, message: 'Vui lòng nhập mã lớp' }]}
          >
            <Input placeholder="Ví dụ: IT4409" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingClass ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassManagement;