package com.collabsphere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChatMessageRequest {
    @NotBlank(message = "Message content is required")
    private String content;

    @NotNull(message = "Team ID is required")
    private Long teamId;

    @NotNull(message = "Sender ID is required")
    private Long senderId;

    public ChatMessageRequest() {}

    public ChatMessageRequest(String content, Long teamId, Long senderId) {
        this.content = content;
        this.teamId = teamId;
        this.senderId = senderId;
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

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }
}