import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  Input,
  Button,
  List,
  Avatar,
  Select,
  Empty,
  Spin,
  message,
  Alert,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  TeamOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import studentService from "../../services/studentService";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const { TextArea } = Input;

const TeamChat = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const messagesEndRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    fetchTeams();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (stompClient && stompClient.connected) {
        console.log("Disconnecting WebSocket on unmount");
        stompClient.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const teamIdParam = searchParams.get("teamId");
    if (teamIdParam && teams.length > 0) {
      const teamId = parseInt(teamIdParam);
      const team = teams.find((t) => t.id === teamId);
      if (team) {
        setSelectedTeam(teamId);
      }
    } else if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].id);
    }
  }, [teams, searchParams]);

  useEffect(() => {
    if (selectedTeam) {
      setMessages([]);
      setConnectionError(false);
      fetchChatHistory();
      connectWebSocket();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [selectedTeam]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await studentService.getMyTeams();
      const teamsArray = Array.isArray(data) ? data : [];
      setTeams(teamsArray);
    } catch (error) {
      console.error("Error fetching teams:", error);
      message.error("Không thể tải danh sách nhóm");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const data = await studentService.getChatHistory(selectedTeam, 0, 50);
      const messagesArray = Array.isArray(data) ? data : [];
      setMessages(messagesArray);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      message.error("Không thể tải lịch sử chat");
      setMessages([]);
    }
  };

  const connectWebSocket = () => {
    try {
      // Clear any existing reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Disconnect existing connection
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }

      // Get base URL from axios config or use default
      const baseUrl = "http://localhost:8080";
      const wsUrl = `${baseUrl}/ws`;

      console.log("🔌 Connecting to WebSocket:", wsUrl);

      const socket = new SockJS(wsUrl);
      const client = Stomp.over(socket);

      // Reduce debug logging
      client.debug = () => {};

      const connectHeaders = {};

      client.connect(
        connectHeaders,
        // Success callback
        () => {
          console.log("✅ WebSocket Connected successfully");
          setConnected(true);
          setConnectionError(false);
          setStompClient(client);

          // Subscribe to team chat topic
          client.subscribe(`/topic/team/${selectedTeam}`, (message) => {
            try {
              const chatMessage = JSON.parse(message.body);
              console.log("📨 New message received:", chatMessage);
              setMessages((prev) => [...prev, chatMessage]);
            } catch (error) {
              console.error("Error parsing message:", error);
            }
          });
        },
        // Error callback
        (error) => {
          console.error("❌ WebSocket connection error:", error);
          setConnected(false);
          setConnectionError(true);

          // Don't auto-retry to avoid spam
          // User can manually retry with refresh button
        }
      );
    } catch (error) {
      console.error("❌ Error initializing WebSocket:", error);
      setConnected(false);
      setConnectionError(true);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) {
      return;
    }

    if (!connected || !stompClient) {
      message.warning(
        "Chưa kết nối đến máy chủ chat. Vui lòng thử kết nối lại."
      );
      return;
    }

    try {
      const chatMessage = {
        content: messageInput.trim(),
        senderId: user.id,
        teamId: selectedTeam,
      };

      stompClient.send(
        `/app/chat/${selectedTeam}`,
        {},
        JSON.stringify(chatMessage)
      );
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      message.error("Không thể gửi tin nhắn");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetryConnection = () => {
    setConnectionError(false);
    connectWebSocket();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
      return "Vừa xong";
    }

    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} phút trước`;
    }

    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} giờ trước`;
    }

    return date.toLocaleDateString("vi-VN");
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
        <Spin size="large" tip="Đang tải..." />
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

  const currentTeam = teams.find((t) => t.id === selectedTeam);

  return (
    <div style={{ padding: "24px", height: "calc(100vh - 64px)" }}>
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              marginBottom: "8px",
              color: "#262626",
            }}
          >
            Chat nhóm
          </h1>
          <p style={{ color: "#8c8c8c" }}>Giao tiếp với thành viên nhóm</p>
        </div>

        <Select
          value={selectedTeam}
          onChange={(value) => {
            setSelectedTeam(value);
            setSearchParams({ teamId: value });
          }}
          style={{ minWidth: "200px" }}
          size="large"
        >
          {teams.map((team) => (
            <Select.Option key={team.id} value={team.id}>
              <TeamOutlined style={{ marginRight: "8px" }} />
              {team.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      {connectionError && (
        <Alert
          message="Không thể kết nối chat real-time"
          description={
            <div>
              <p>Vui lòng kiểm tra:</p>
              <ul style={{ marginBottom: "8px", paddingLeft: "20px" }}>
                <li>Backend đang chạy tại http://localhost:8080</li>
                <li>WebSocket endpoint /ws có sẵn</li>
              </ul>
              <Button
                type="primary"
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleRetryConnection}
              >
                Thử kết nối lại
              </Button>
            </div>
          }
          type="warning"
          showIcon
          closable
          style={{ marginBottom: "16px" }}
        />
      )}

      <Card
        style={{
          height: "calc(100% - 120px)",
          display: "flex",
          flexDirection: "column",
        }}
        bodyStyle={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: 0,
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar
              icon={<TeamOutlined />}
              size={40}
              style={{ background: "#1890ff" }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: "16px" }}>
                {currentTeam?.name}
              </div>
              <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                {currentTeam?.members?.length || 0} thành viên •{" "}
                {connected ? "🟢 Đã kết nối" : "🔴 Chưa kết nối"}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            background: "#fff",
          }}
        >
          {messages.length === 0 ? (
            <Empty
              description="Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!"
              style={{ marginTop: "50px" }}
            />
          ) : (
            <List
              dataSource={messages}
              renderItem={(msg) => {
                const isMyMessage =
                  msg.senderId === user.id || msg.sender?.id === user.id;
                const senderName =
                  msg.senderName || msg.sender?.fullName || "Không rõ";

                return (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: isMyMessage ? "flex-end" : "flex-start",
                      marginBottom: "16px",
                    }}
                  >
                    {!isMyMessage && (
                      <Avatar
                        icon={<UserOutlined />}
                        style={{ marginRight: "8px" }}
                      />
                    )}
                    <div style={{ maxWidth: "60%" }}>
                      {!isMyMessage && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#8c8c8c",
                            marginBottom: "4px",
                            marginLeft: "8px",
                          }}
                        >
                          {senderName}
                        </div>
                      )}
                      <div
                        style={{
                          padding: "12px 16px",
                          borderRadius: "12px",
                          background: isMyMessage ? "#1890ff" : "#f0f0f0",
                          color: isMyMessage ? "#fff" : "#262626",
                          wordBreak: "break-word",
                        }}
                      >
                        {msg.content}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#8c8c8c",
                          marginTop: "4px",
                          textAlign: isMyMessage ? "right" : "left",
                          marginLeft: isMyMessage ? "0" : "8px",
                          marginRight: isMyMessage ? "8px" : "0",
                        }}
                      >
                        {formatTime(msg.timestamp || msg.createdAt)}
                      </div>
                    </div>
                    {isMyMessage && (
                      <Avatar
                        icon={<UserOutlined />}
                        style={{ marginLeft: "8px", background: "#1890ff" }}
                      />
                    )}
                  </div>
                );
              }}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        <div
          style={{
            padding: "16px",
            borderTop: "1px solid #f0f0f0",
            background: "#fafafa",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <TextArea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                connected
                  ? "Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
                  : "Chưa kết nối đến máy chủ chat..."
              }
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ flex: 1 }}
              disabled={!connected}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={!connected || !messageInput.trim()}
              size="large"
            >
              Gửi
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TeamChat;
