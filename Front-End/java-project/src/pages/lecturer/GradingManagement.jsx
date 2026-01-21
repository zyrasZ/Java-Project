import { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Modal, Form, message, Space, 
  Select, InputNumber, Typography, Input, Tag, Row, Col, Statistic
} from 'antd';
import { 
  TrophyOutlined, EditOutlined, EyeOutlined
} from '@ant-design/icons';
import lecturerService from '../../services/lecturerService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const GradingManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gradeModal, setGradeModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [gradeForm] = Form.useForm();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await lecturerService.getMyProjects();
      const approvedProjects = (response.data.data || []).filter(p => p.status === 'APPROVED');
      setProjects(approvedProjects);
    } catch {
      message.error('Không thể tải danh sách dự án');
    }
  };

  const handleProjectChange = async (projectId) => {
    try {
      setLoading(true);
      const project = projects.find(p => p.id === projectId);
      setSelectedProject(project);
      
      const response = await lecturerService.getTeamsByProject(projectId);
      setTeams(response.data.data || []);
    } catch {
      message.error('Không thể tải danh sách nhóm');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (values) => {
    try {
      await lecturerService.gradeTeam(selectedTeam.id, {
        score: values.score,
        feedback: values.feedback
      });

      message.success('Chấm điểm thành công');
      setGradeModal(false);
      gradeForm.resetFields();
      
      // Refresh teams to show updated grades
      if (selectedProject) {
        await handleProjectChange(selectedProject.id);
      }
    } catch {
      message.error('Chấm điểm thất bại');
    }
  };

  const handleViewGrade = (team) => {
    setSelectedTeam(team);
    setViewModal(true);
  };

  const teamColumns = [
    {
      title: 'Tên nhóm',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Tag color="blue">{name}</Tag>
    },
    {
      title: 'Số thành viên',
      dataIndex: 'members',
      key: 'memberCount',
      render: (members) => members?.length || 0
    },
    {
      title: 'Điểm',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade) => grade ? (
        <Tag color={grade >= 8 ? 'green' : grade >= 5 ? 'orange' : 'red'}>
          {grade.toFixed(1)}/10
        </Tag>
      ) : (
        <Tag color="default">Chưa chấm</Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedTeam(record);
              if (record.grade) {
                gradeForm.setFieldsValue({
                  score: record.grade,
                  feedback: record.feedback || ''
                });
              }
              setGradeModal(true);
            }}
          >
            {record.grade ? 'Sửa điểm' : 'Chấm điểm'}
          </Button>
          {record.grade && (
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewGrade(record)}
            >
              Xem
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        <TrophyOutlined /> Chấm điểm
      </Title>

      {/* Statistics */}
      {selectedProject && teams.length > 0 && (
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số nhóm"
                value={teams.length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã chấm"
                value={teams.filter(t => t.grade).length}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Chưa chấm"
                value={teams.filter(t => !t.grade).length}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Điểm TB"
                value={teams.filter(t => t.grade).length > 0 
                  ? (teams.filter(t => t.grade).reduce((sum, t) => sum + t.grade, 0) / teams.filter(t => t.grade).length).toFixed(1)
                  : 0}
                valueStyle={{ color: '#722ed1' }}
                suffix="/ 10"
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card style={{ marginBottom: '16px' }}>
        <div>
          <Text strong>Chọn dự án:</Text>
          <Select
            style={{ width: '100%', marginTop: '8px' }}
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
      </Card>

      {selectedProject && (
        <Card title="Danh sách nhóm">
          <Table
            columns={teamColumns}
            dataSource={teams}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}

      {/* Grade Modal */}
      <Modal
        title={`Chấm điểm - ${selectedTeam?.name}`}
        open={gradeModal}
        onCancel={() => {
          setGradeModal(false);
          gradeForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form form={gradeForm} layout="vertical" onFinish={handleGrade}>
          <Form.Item
            name="score"
            label="Điểm (0-10)"
            rules={[
              { required: true, message: 'Vui lòng nhập điểm' },
              { type: 'number', min: 0, max: 10, message: 'Điểm phải từ 0-10' }
            ]}
          >
            <InputNumber 
              min={0} 
              max={10} 
              step={0.5} 
              style={{ width: '100%' }}
              placeholder="Nhập điểm từ 0-10"
            />
          </Form.Item>
          <Form.Item
            name="feedback"
            label="Nhận xét"
            rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhận xét về dự án của nhóm..."
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Chấm điểm
              </Button>
              <Button onClick={() => {
                setGradeModal(false);
                gradeForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Grade Modal */}
      <Modal
        title={`Điểm - ${selectedTeam?.name}`}
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={[
          <Button key="close" onClick={() => setViewModal(false)}>
            Đóng
          </Button>
        ]}
      >
        {selectedTeam && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card size="small">
              <Statistic
                title="Điểm"
                value={selectedTeam.grade}
                suffix="/ 10"
                valueStyle={{ 
                  color: selectedTeam.grade >= 8 ? '#52c41a' : selectedTeam.grade >= 5 ? '#faad14' : '#ff4d4f',
                  fontSize: '32px'
                }}
              />
            </Card>
            <div>
              <Text strong>Nhận xét:</Text>
              <Card size="small" style={{ marginTop: '8px' }}>
                <Text>{selectedTeam.feedback || 'Không có nhận xét'}</Text>
              </Card>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default GradingManagement;
