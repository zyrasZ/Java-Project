package com.collabsphere.dto;

import com.collabsphere.entity.Project;
import com.collabsphere.entity.enums.ProjectStatus;

import java.time.LocalDateTime;

public class ProjectDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime deadline;
    private ProjectStatus status;
    private Long classroomId;
    private String classroomName;
    private String classroomCode;
    private Long lecturerId;
    private String lecturerName;
    private String lecturerEmail;

    // Constructors
    public ProjectDTO() {}

    public ProjectDTO(Project project) {
        this.id = project.getId();
        this.title = project.getTitle();
        this.description = project.getDescription();
        this.deadline = project.getDeadline();
        this.status = project.getStatus();
        
        if (project.getClassRoom() != null) {
            this.classroomId = project.getClassRoom().getId();
            this.classroomName = project.getClassRoom().getName();
            this.classroomCode = project.getClassRoom().getCode();
            
            if (project.getClassRoom().getLecturer() != null) {
                this.lecturerId = project.getClassRoom().getLecturer().getId();
                this.lecturerName = project.getClassRoom().getLecturer().getFullName();
                this.lecturerEmail = project.getClassRoom().getLecturer().getEmail();
            }
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public Long getClassroomId() {
        return classroomId;
    }

    public void setClassroomId(Long classroomId) {
        this.classroomId = classroomId;
    }

    public String getClassroomName() {
        return classroomName;
    }

    public void setClassroomName(String classroomName) {
        this.classroomName = classroomName;
    }

    public String getClassroomCode() {
        return classroomCode;
    }

    public void setClassroomCode(String classroomCode) {
        this.classroomCode = classroomCode;
    }

    public Long getLecturerId() {
        return lecturerId;
    }

    public void setLecturerId(Long lecturerId) {
        this.lecturerId = lecturerId;
    }

    public String getLecturerName() {
        return lecturerName;
    }

    public void setLecturerName(String lecturerName) {
        this.lecturerName = lecturerName;
    }

    public String getLecturerEmail() {
        return lecturerEmail;
    }

    public void setLecturerEmail(String lecturerEmail) {
        this.lecturerEmail = lecturerEmail;
    }
}