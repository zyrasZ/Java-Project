import { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Modal, Form, Input, message, Space, Tag, 
  Popconfirm, Typography, Drawer
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined,
  BookOutlined
} from '@ant-design/icons';
import lecturerService from '../../services/lecturerService';

const { Title } = Typography;

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [form] = Form.useForm();
  const [studentForm] = Form.useForm();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await lecturerService.getMyClasses();
      setClasses(response.data.data || []);
    } catch (error) {
      message.error('Không thể tải danh sách lớp học');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    try {
      await lecturerService.createClass(values);
      message.success('Tạo lớp học thành công');
      setModalVisible(false);
      form.resetFields();
      fetchClasses();
    } catch (error) {
      message.error(error.response?.data?.message || 'Tạo lớp học thất bại');
    }
  };

  const handleAddStudent = async (values) => {
    try {
      await lecturerService.addStudentToClass(selectedClass.id, values.email);
      message.success('Thêm sinh viên thành công');
      studentForm.resetFields();
      setDrawerVisible(false);
      fetchClasses();
    } catch (error) {
      message.error(error.response?.data?.message || 'Thêm sinh viên thất bại');
    }
  };

  const handleRemoveStudent = async (classId, email) => {
    try {
      await lecturerService.removeStudentFromClass(classId, email);
      message.success('Xóa sinh viên thành công');
      fetchClasses();
    } catch (error) {
      message.error('Xóa sinh viên thất bại');
    }
  };

  const columns = [
    {
      title: 'Mã lớp',
      dataIndex: 'code',
      key: 'code',
      render: (code) => <Tag color="blue">{code}</Tag>
    },
    {
      title: 'Tên lớp',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số sinh viên',
      dataIndex: 'students',
      key: 'studentCount',
      render: (students) => students?.length || 0
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<UserAddOutlined />}
            onClick={() => {
              setSelectedClass(record);
              setDrawerVisible(true);
            }}
          >
            Thêm SV
          </Button>
          <Button
            type="link"
            onClick={() => {
              setSelectedClass(record);
              // Navigate to class detail
            }}
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
          <BookOutlined /> Quản lý lớp học
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Tạo lớp học
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={classes}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create Class Modal */}
      <Modal
        title="Tạo lớp học mới"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="name"
            label="Tên lớp"
            rules={[{ required: true, message: 'Vui lòng nhập tên lớp' }]}
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

      {/* Add Student Drawer */}
      <Drawer
        title={`Thêm sinh viên vào ${selectedClass?.name}`}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          studentForm.resetFields();
        }}
        width={400}
      >
        <Form
          form={studentForm}
          layout="vertical"
          onFinish={handleAddStudent}
        >
          <Form.Item
            name="email"
            label="Email sinh viên"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="student@example.com" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Thêm sinh viên
            </Button>
          </Form.Item>
        </Form>

        {selectedClass?.students && selectedClass.students.length > 0 && (
          <>
            <Title level={5} style={{ marginTop: '24px' }}>
              Danh sách sinh viên ({selectedClass.students.length})
            </Title>
            {selectedClass.students.map((student) => (
              <Card
                key={student.id}
                size="small"
                style={{ marginBottom: '8px' }}
                extra={
                  <Popconfirm
                    title="Xóa sinh viên này?"
                    onConfirm={() => handleRemoveStudent(selectedClass.id, student.email)}
                  >
                    <Button type="link" danger size="small">
                      Xóa
                    </Button>
                  </Popconfirm>
                }
              >
                <div>{student.fullName}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{student.email}</div>
              </Card>
            ))}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default ClassManagement;
