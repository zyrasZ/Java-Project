package com.collabsphere.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class AutoGenerateTeamsRequest {
    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Group size is required")
    @Min(value = 2, message = "Group size must be at least 2")
    private Integer groupSize;

    public AutoGenerateTeamsRequest() {}

    public AutoGenerateTeamsRequest(Long projectId, Integer groupSize) {
        this.projectId = projectId;
        this.groupSize = groupSize;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Integer getGroupSize() {
        return groupSize;
    }

    public void setGroupSize(Integer groupSize) {
        this.groupSize = groupSize;
    }
}