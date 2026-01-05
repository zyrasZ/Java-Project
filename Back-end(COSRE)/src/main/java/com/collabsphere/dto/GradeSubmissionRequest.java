package com.collabsphere.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class GradeSubmissionRequest {
    @NotNull(message = "Submission ID is required")
    private Long submissionId;

    @NotNull(message = "Grade is required")
    @Min(value = 0, message = "Grade must be at least 0")
    @Max(value = 100, message = "Grade must be at most 100")
    private Double grade;

    private String feedback;

    public GradeSubmissionRequest() {}

    public GradeSubmissionRequest(Long submissionId, Double grade, String feedback) {
        this.submissionId = submissionId;
        this.grade = grade;
        this.feedback = feedback;
    }

    public Long getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(Long submissionId) {
        this.submissionId = submissionId;
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
}