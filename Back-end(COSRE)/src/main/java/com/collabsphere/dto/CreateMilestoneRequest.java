package com.collabsphere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class CreateMilestoneRequest {
    @NotBlank(message = "Milestone title is required")
    private String title;

    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;

    public CreateMilestoneRequest() {}

    public CreateMilestoneRequest(String title, LocalDateTime dueDate) {
        this.title = title;
        this.dueDate = dueDate;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }
}