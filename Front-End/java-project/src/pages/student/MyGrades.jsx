import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Empty,
  Spin,
  message,
  Typography,
  Tag,
  Collapse,
  Descriptions,
} from "antd";
import { TrophyOutlined, TeamOutlined } from "@ant-design/icons";
import studentService from "../../services/studentService";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const MyGrades = () => {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [grades, setGrades] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch my teams
      const teamsData = await studentService.getMyTeams();
      const teamsArray = Array.isArray(teamsData) ? teamsData : [];
      setTeams(teamsArray);

      // 2. Fetch grades for each team
      const gradesData = {};

      for (const team of teamsArray) {
        try {
          // Fetch scores for this team
          const scores = await studentService.getTeamScores(team.id);
          gradesData[team.id] = scores;
        } catch (err) {
          console.error(`Error fetching grades for team ${team.id}:`, err);
          gradesData[team.id] = [];
        }
      }

      setGrades(gradesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Không thể tải dữ liệu điểm số");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" tip="Đang tải điểm số..." />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div style={{ padding: "24px" }}>
        <Card>
          <Empty description="Bạn chưa tham gia nhóm nào" />
        </Card>
      </div>
    );
  }

  // Define columns for the grades table
  const columns = [
    {
      title: "Tiêu chí",
      dataIndex: "criteriaName",
      key: "criteriaName",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Điểm tối đa",
      dataIndex: "maxScore",
      key: "maxScore",
      align: "center",
      render: (score) => <Tag color="blue">{score}</Tag>,
    },
    {
      title: "Điểm đạt được",
      dataIndex: "score",
      key: "score",
      align: "center",
      render: (score) => (
        <Tag color={score ? (score >= 5 ? "green" : "red") : "default"}>
          {score !== null && score !== undefined ? score : "Chưa chấm"}
        </Tag>
      ),
    },
    {
      title: "Nhận xét",
      dataIndex: "feedback",
      key: "feedback",
      ellipsis: true,
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>
          <TrophyOutlined style={{ marginRight: "12px", color: "#faad14" }} />
          Bảng điểm của tôi
        </Title>
        <Text type="secondary">
          Xem điểm số và đánh giá dự án của các nhóm bạn tham gia
        </Text>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {teams.map((team) => {
          const teamGrades = grades[team.id] || [];
          const totalScore = teamGrades.reduce(
            (sum, item) => sum + (item.score || 0),
            0
          );
          const maxTotalScore = teamGrades.reduce(
            (sum, item) => sum + (item.maxScore || 10),
            0
          ); // Assuming 10 if not specified, usually criteria has maxScore

          return (
            <Card
              key={team.id}
              title={
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <TeamOutlined />
                  <span>{team.name}</span>
                  <Tag color="geekblue" style={{ marginLeft: "8px" }}>
                    {team.project?.name || "Dự án"}
                  </Tag>
                </div>
              }
              extra={
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                    Tổng điểm: {totalScore} / {maxTotalScore}
                  </Text>
                </div>
              }
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
            >
              {teamGrades.length > 0 ? (
                <Table
                  dataSource={teamGrades}
                  columns={columns}
                  pagination={false}
                  rowKey="id"
                  size="small"
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có dữ liệu điểm cho nhóm này"
                />
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MyGrades;
