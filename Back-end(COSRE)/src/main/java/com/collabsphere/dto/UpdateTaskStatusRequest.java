package com.collabsphere.dto;

import com.collabsphere.entity.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateTaskStatusRequest {
    @NotNull(message = "New status is required")
    private TaskStatus newStatus;

    public UpdateTaskStatusRequest() {}

    public UpdateTaskStatusRequest(TaskStatus newStatus) {
        this.newStatus = newStatus;
    }

    public TaskStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(TaskStatus newStatus) {
        this.newStatus = newStatus;
    }
}