package com.collabsphere.dto;

import java.time.LocalDateTime;

public class ChatMessageResponse {
    private Long id;
    private String content;
    private Long teamId;
    private String teamName;
    private Long senderId;
    private String senderName;
    private LocalDateTime timestamp;

    public ChatMessageResponse() {}

    public ChatMessageResponse(Long id, String content, Long teamId, String teamName, 
                              Long senderId, String senderName, LocalDateTime timestamp) {
        this.id = id;
        this.content = content;
        this.teamId = teamId;
        this.teamName = teamName;
        this.senderId = senderId;
        this.senderName = senderName;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}