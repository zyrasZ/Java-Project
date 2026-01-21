import { useState } from 'react';
import { 
  Card, 
  Upload, 
  Button, 
  Typography, 
  Alert, 
  Table,
  message,
  Divider,
  Space,
  Tag,
  Statistic,
  Row,
  Col
} from 'antd';
import { 
  DownloadOutlined,
  UserOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import axiosInstance from '../../config/axios';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const ImportUsers = () => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [importedUsers, setImportedUsers] = useState([]);

  // Columns for imported users table
  const importedUsersColumns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id',
      width: 80
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email',
      width: 250
    },
    { 
      title: 'Họ và tên', 
      dataIndex: 'fullName', 
      key: 'fullName',
      width: 200
    },
    { 
      title: 'Vai trò', 
      dataIndex: 'role', 
      key: 'role',
      width: 120,
      render: (role) => {
        const colors = {
          STUDENT: 'blue',
          LECTURER: 'green',
          ADMIN: 'red',
          STAFF: 'orange'
        };
        return <Tag color={colors[role] || 'default'}>{role}</Tag>;
      }
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'active', 
      key: 'active',
      width: 120,
      render: (active) => (
        <Tag color={active ? 'success' : 'error'}>
          {active ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      )
    }
  ];

  // Template data for users
  const templateColumns = [
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'FullName', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Password', dataIndex: 'password', key: 'password' },
  ];

  const templateData = [
    {
      key: 1,
      email: 'student1@example.com',
      fullName: 'Nguyễn Văn A',
      role: 'STUDENT',
      password: '123456'
    },
    {
      key: 2,
      email: 'lecturer1@example.com',
      fullName: 'GS. Trần Văn B',
      role: 'LECTURER',
      password: '123456'
    }
  ];

  const handleImport = async (file) => {
    setUploading(true);
    setResult(null);
    setImportedUsers([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosInstance.post('/api/staff/import/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        const data = response.data.data;
        setResult({
          type: 'success',
          totalRows: data.totalRows,
          createdUsers: data.createdUsers,
          skippedUsers: data.skippedUsers,
          errors: data.errors
        });
        setImportedUsers(data.importedUsers || []);
        message.success('Import người dùng thành công!');
      } else {
        setResult({
          type: 'error',
          message: response.data.message || 'Import thất bại'
        });
        message.error('Import người dùng thất bại!');
      }
    } catch (error) {
      console.error('Import users error:', error);
      setResult({
        type: 'error',
        message: error.response?.data?.message || 'Có lỗi xảy ra khi import'
      });
      message.error('Có lỗi xảy ra khi import người dùng!');
    } finally {
      setUploading(false);
    }

    return false; // Prevent default upload behavior
  };

  const downloadTemplate = () => {
    // Create CSV content for template
    const csvContent = "Email,FullName,Role,Password\n" +
      "student1@example.com,Nguyễn Văn A,STUDENT,123456\n" +
      "lecturer1@example.com,GS. Trần Văn B,LECTURER,123456\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: '24px' }}>
        <Space>
          <UserOutlined />
          Import người dùng
        </Space>
      </Title>

      <Card 
        extra={
          <Button 
            icon={<DownloadOutlined />} 
            onClick={downloadTemplate}
          >
            Tải template
          </Button>
        }
      >
        <Paragraph>
          Import danh sách người dùng từ file Excel. File phải có định dạng như mẫu bên dưới.
        </Paragraph>

        <Dragger
          accept=".xlsx,.xls,.csv"
          beforeUpload={handleImport}
          showUploadList={false}
          loading={uploading}
          style={{ marginBottom: '24px' }}
        >
          <p className="ant-upload-drag-icon">
            <FileExcelOutlined />
          </p>
          <p className="ant-upload-text">
            Kéo thả file Excel vào đây hoặc click để chọn file
          </p>
          <p className="ant-upload-hint">
            Hỗ trợ file .xlsx, .xls, .csv
          </p>
        </Dragger>

        {result && result.type === 'success' && (
          <>
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Tổng số dòng xử lý"
                    value={result.totalRows}
                    prefix={<FileExcelOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Số user được tạo"
                    value={result.createdUsers}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Số user bị bỏ qua"
                    value={result.skippedUsers}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {result.errors && result.errors.length > 0 && (
              <Alert
                type="warning"
                message="Có một số lỗi trong quá trình import"
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                    {result.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                }
                showIcon
                icon={<WarningOutlined />}
                style={{ marginBottom: '24px' }}
              />
            )}

            {importedUsers.length > 0 && (
              <>
                <Divider>Danh sách người dùng đã import</Divider>
                <Table
                  columns={importedUsersColumns}
                  dataSource={importedUsers}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `Tổng ${total} người dùng`
                  }}
                  bordered
                  size="small"
                />
              </>
            )}

            {importedUsers.length === 0 && result.createdUsers === 0 && (
              <Alert
                type="info"
                message="Không có người dùng mới được tạo"
                description="Tất cả email trong file đã tồn tại trong hệ thống hoặc có lỗi. Vui lòng kiểm tra lại file import."
                showIcon
                style={{ marginBottom: '24px' }}
              />
            )}
          </>
        )}

        {result && result.type === 'error' && (
          <Alert
            type="error"
            message="Lỗi import"
            description={result.message}
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Divider>Định dạng file mẫu</Divider>
        <Table
          columns={templateColumns}
          dataSource={templateData}
          pagination={false}
          size="small"
          bordered
        />
        
        <div style={{ marginTop: '16px' }}>
          <Text type="secondary">
            <strong>Lưu ý:</strong>
            <br />
            • Role có thể là: STUDENT, LECTURER
            <br />
            • Email phải là duy nhất trong hệ thống
            <br />
            • Password sẽ được mã hóa tự động
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ImportUsers;