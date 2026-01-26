package com.collabsphere.dto;

import java.time.LocalDateTime;

public class SubmissionDTO {
    private Long id;
    private String link;
    private LocalDateTime submittedAt;
    private Double grade;
    private String feedback;
    private LocalDateTime gradedAt;
    
    // Milestone info
    private Long milestoneId;
    private String milestoneTitle;
    private LocalDateTime milestoneDueDate;
    
    // Team info
    private Long teamId;
    private String teamName;
    
    // Project info
    private Long projectId;
    private String projectTitle;

    // Constructors
    public SubmissionDTO() {}

    public SubmissionDTO(Long id, String link, LocalDateTime submittedAt, Double grade, 
                        String feedback, LocalDateTime gradedAt, Long milestoneId, 
                        String milestoneTitle, LocalDateTime milestoneDueDate, 
                        Long teamId, String teamName, Long projectId, String projectTitle) {
        this.id = id;
        this.link = link;
        this.submittedAt = submittedAt;
        this.grade = grade;
        this.feedback = feedback;
        this.gradedAt = gradedAt;
        this.milestoneId = milestoneId;
        this.milestoneTitle = milestoneTitle;
        this.milestoneDueDate = milestoneDueDate;
        this.teamId = teamId;
        this.teamName = teamName;
        this.projectId = projectId;
        this.projectTitle = projectTitle;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Double getGrade() {
        return grade;
    }

    public void setGrade(Double grade) {
        this.grade = grade;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public LocalDateTime getGradedAt() {
        return gradedAt;
    }

    public void setGradedAt(LocalDateTime gradedAt) {
        this.gradedAt = gradedAt;
    }

    public Long getMilestoneId() {
        return milestoneId;
    }

    public void setMilestoneId(Long milestoneId) {
        this.milestoneId = milestoneId;
    }

    public String getMilestoneTitle() {
        return milestoneTitle;
    }

    public void setMilestoneTitle(String milestoneTitle) {
        this.milestoneTitle = milestoneTitle;
    }

    public LocalDateTime getMilestoneDueDate() {
        return milestoneDueDate;
    }

    public void setMilestoneDueDate(LocalDateTime milestoneDueDate) {
        this.milestoneDueDate = milestoneDueDate;
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

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public void setProjectTitle(String projectTitle) {
        this.projectTitle = projectTitle;
    }
}