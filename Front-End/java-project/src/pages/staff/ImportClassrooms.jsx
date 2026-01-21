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
  TeamOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import axiosInstance from '../../config/axios';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const ImportClassrooms = () => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [importedClassrooms, setImportedClassrooms] = useState([]);

  // Columns for imported classrooms table
  const importedClassroomsColumns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id',
      width: 80
    },
    { 
      title: 'Mã lớp', 
      dataIndex: 'code', 
      key: 'code',
      width: 120,
      render: (code) => <Tag color="blue">{code}</Tag>
    },
    { 
      title: 'Tên lớp', 
      dataIndex: 'name', 
      key: 'name',
      width: 250
    },
    { 
      title: 'Giảng viên', 
      dataIndex: 'lecturerName', 
      key: 'lecturerName',
      width: 200,
      render: (name) => name || <Text type="secondary">Chưa có</Text>
    },
    { 
      title: 'Email giảng viên', 
      dataIndex: 'lecturerEmail', 
      key: 'lecturerEmail',
      width: 250,
      render: (email) => email || <Text type="secondary">-</Text>
    }
  ];

  // Template data for classrooms
  const templateColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'LecturerEmail', dataIndex: 'lecturerEmail', key: 'lecturerEmail' },
    { title: 'StudentEmails', dataIndex: 'studentEmails', key: 'studentEmails' },
  ];

  const templateData = [
    {
      key: 1,
      name: 'Lập trình Web',
      code: 'IT4409',
      lecturerEmail: 'lecturer@example.com',
      studentEmails: 'student1@example.com;student2@example.com'
    }
  ];

  const handleImport = async (file) => {
    setUploading(true);
    setResult(null);
    setImportedClassrooms([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosInstance.post('/api/staff/import/classrooms', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        const data = response.data.data;
        setResult({
          type: 'success',
          totalRows: data.totalRows,
          createdClassrooms: data.createdClassrooms,
          skippedClassrooms: data.skippedClassrooms,
          errors: data.errors
        });
        setImportedClassrooms(data.importedClassrooms || []);
        message.success('Import lớp học thành công!');
      } else {
        setResult({
          type: 'error',
          message: response.data.message || 'Import thất bại'
        });
        message.error('Import lớp học thất bại!');
      }
    } catch (error) {
      console.error('Import classrooms error:', error);
      setResult({
        type: 'error',
        message: error.response?.data?.message || 'Có lỗi xảy ra khi import'
      });
      message.error('Có lỗi xảy ra khi import lớp học!');
    } finally {
      setUploading(false);
    }

    return false; // Prevent default upload behavior
  };

  const downloadTemplate = () => {
    // Create CSV content for template
    const csvContent = "Name,Code,LecturerEmail,StudentEmails\n" +
      "Lập trình Web,IT4409,lecturer@example.com,student1@example.com;student2@example.com\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'classroom_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: '24px' }}>
        <Space>
          <TeamOutlined />
          Import lớp học
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
          Import danh sách lớp học từ file Excel. File phải có định dạng như mẫu bên dưới.
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
                    title="Số lớp được tạo"
                    value={result.createdClassrooms}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Số lớp bị bỏ qua"
                    value={result.skippedClassrooms}
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

            {importedClassrooms.length > 0 && (
              <>
                <Divider>Danh sách lớp học đã import</Divider>
                <Table
                  columns={importedClassroomsColumns}
                  dataSource={importedClassrooms}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `Tổng ${total} lớp học`
                  }}
                  bordered
                  size="small"
                />
              </>
            )}

            {importedClassrooms.length === 0 && result.createdClassrooms === 0 && (
              <Alert
                type="info"
                message="Không có lớp học mới được tạo"
                description="Tất cả mã lớp trong file đã tồn tại trong hệ thống hoặc có lỗi. Vui lòng kiểm tra lại file import."
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
            • LecturerEmail phải tồn tại trong hệ thống
            <br />
            • StudentEmails cách nhau bằng dấu chấm phẩy (;)
            <br />
            • Code lớp học phải là duy nhất
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ImportClassrooms;