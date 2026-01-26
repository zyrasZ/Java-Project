package com.collabsphere.dto;

import com.collabsphere.entity.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class CreateProjectRequest {
    @NotBlank(message = "Project title is required")
    private String title;

    private String description;

    @NotNull(message = "Deadline is required")
    private LocalDateTime deadline;

    @NotNull(message = "Classroom ID is required")
    private Long classroomId;

    private ProjectStatus status = ProjectStatus.PENDING; // Mặc định là PENDING

    public CreateProjectRequest() {}

    public CreateProjectRequest(String title, String description, LocalDateTime deadline, Long classroomId) {
        this.title = title;
        this.description = description;
        this.deadline = deadline;
        this.classroomId = classroomId;
        this.status = ProjectStatus.PENDING;
    }

    public CreateProjectRequest(String title, String description, LocalDateTime deadline, Long classroomId, ProjectStatus status) {
        this.title = title;
        this.description = description;
        this.deadline = deadline;
        this.classroomId = classroomId;
        this.status = status;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public Long getClassroomId() {
        return classroomId;
    }

    public void setClassroomId(Long classroomId) {
        this.classroomId = classroomId;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }
}