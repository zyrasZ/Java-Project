package com.collabsphere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateSubmissionRequest {
    @NotBlank(message = "Submission link is required")
    private String link;

    @NotNull(message = "Milestone ID is required")
    private Long milestoneId;

    @NotNull(message = "Team ID is required")
    private Long teamId;

    public CreateSubmissionRequest() {}

    public CreateSubmissionRequest(String link, Long milestoneId, Long teamId) {
        this.link = link;
        this.milestoneId = milestoneId;
        this.teamId = teamId;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public Long getMilestoneId() {
        return milestoneId;
    }

    public void setMilestoneId(Long milestoneId) {
        this.milestoneId = milestoneId;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }
}