import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Form,
  Popconfirm,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Tooltip,
  App
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';

const { Title } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const { message } = App.useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    keyword: '',
    role: null,
    active: null,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (pagination.current > 1 || pagination.pageSize !== 10) {
      fetchUsers();
    }
  }, [pagination.current, pagination.pageSize]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: pagination.current - 1, // Sử dụng current page trực tiếp
        size: pagination.pageSize,
      };

      if (filters.keyword && filters.keyword.trim()) {
        params.keyword = filters.keyword.trim();
      }
      if (filters.role) {
        params.role = filters.role;
      }
      if (filters.active !== null && filters.active !== undefined) {
        params.active = filters.active;
      }

      console.log('Fetching users with params:', params);
      
      const response = await adminService.getAllUsers(params);
      console.log('API response:', response);
      
      if (response && response.status === 'success' && response.data) {
        const usersData = response.data.content || [];
        const total = response.data.totalElements || 0;
        
        console.log('Users data:', usersData.length, 'Total:', total);
        
        const processedUsers = usersData.map((user, index) => ({
          ...user,
          key: user.id || user.email || index,
        }));
        
        setUsers(processedUsers);
        setPagination(prev => ({
          ...prev,
          total: total,
        }));
      } else {
        setUsers([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      
      // Chỉ xử lý lỗi đơn giản, không gọi lại fetchUsers
      if (err.response?.status === 400) {
        console.log('Page not found, clearing data');
        setUsers([]);
      } else {
        setUsers([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await adminService.getAllRoles();
      if (response.status === 'success') {
        setRoles(response.data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const handleTableChange = (paginationInfo) => {
    console.log('Table pagination changed:', paginationInfo);
    
    // Chỉ cập nhật pagination, không validate ở đây
    // Để API tự xử lý và trả về lỗi nếu trang không hợp lệ
    setPagination(paginationInfo);
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(() => {
      fetchUsers();
    }, 100);
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      role: null,
      active: null,
    });
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(() => {
      fetchUsers();
    }, 100);
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      active: user.active,
      phoneNumber: user.phoneNumber,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        const response = await adminService.updateUser(editingUser.id, values);
        if (response.status === 'success') {
          message.success('Cập nhật người dùng thành công');
          fetchUsers();
          setModalVisible(false);
        }
      } else {
        const response = await adminService.createUser(values);
        if (response.status === 'success') {
          message.success('Tạo người dùng thành công');
          fetchUsers();
          setModalVisible(false);
        }
      }
    } catch (err) {
      console.error('Error submitting user:', err);
      message.error(editingUser ? 'Cập nhật thất bại' : 'Tạo người dùng thất bại');
    }
  };

  const handleDelete = async (userId) => {
    try {
      const response = await adminService.deleteUser(userId);
      if (response.status === 'success') {
        message.success('Khóa tài khoản thành công');
        fetchUsers();
      }
    } catch (err) {
      console.error('Error deactivating user:', err);
      message.error('Khóa tài khoản thất bại');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const response = await adminService.toggleUserStatus(userId);
      if (response.status === 'success') {
        message.success('Thay đổi trạng thái thành công');
        fetchUsers();
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      message.error('Thay đổi trạng thái thất bại');
    }
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      ellipsis: true,
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colors = {
          ADMIN: 'red',
          LECTURER: 'purple',
          STUDENT: 'blue',
          STAFF: 'orange',
          HEAD_DEPARTMENT: 'green',
        };
        return <Tag color={colors[role]}>{role}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Hoạt động' : 'Bị khóa'}
        </Tag>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
            <Button
              type={record.active ? 'default' : 'primary'}
              size="small"
              icon={record.active ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleToggleStatus(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn khóa tài khoản này?"
            description="Tài khoản sẽ không thể đăng nhập nhưng dữ liệu vẫn được bảo toàn"
            onConfirm={() => handleDelete(record.id)}
            okText="Khóa tài khoản"
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
      <Title level={2}>Quản lý người dùng</Title>

      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm theo email hoặc tên"
              prefix={<SearchOutlined />}
              value={filters.keyword}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Chọn vai trò"
              allowClear
              style={{ width: '100%' }}
              value={filters.role}
              onChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
            >
              {roles.map(role => (
                <Option key={role} value={role}>{role}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: '100%' }}
              value={filters.active}
              onChange={(value) => setFilters(prev => ({ ...prev, active: value }))}
            >
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Bị khóa</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                Tìm kiếm
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Thêm người dùng
          </Button>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchUsers}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey={(record) => record.key || record.id || record.email}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} người dùng`,
            // Đảm bảo không hiển thị trang không hợp lệ
            simple: false,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
          locale={{
            emptyText: users.length === 0 && !loading ? 'Không có dữ liệu' : 'Đang tải...'
          }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
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
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select>
              {roles.map(role => (
                <Option key={role} value={role}>{role}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
          >
            <Input />
          </Form.Item>

          {editingUser && (
            <Form.Item
              name="active"
              label="Trạng thái"
              valuePropName="checked"
            >
              <Select>
                <Option value={true}>Hoạt động</Option>
                <Option value={false}>Bị khóa</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;