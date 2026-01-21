package com.collabsphere.dto;

import java.time.LocalDateTime;

public class RubricScoreDTO {
    private Long id;
    private Long teamId;
    private String teamName;
    private Long criteriaId;
    private String criteriaName;
    private String criteriaDescription;
    private Double maxScore;
    private Double score;
    private Double weight;
    private String feedback;
    private String gradedBy;
    private LocalDateTime gradedAt;

    public RubricScoreDTO() {}

    public RubricScoreDTO(Long id, Long teamId, String teamName, Long criteriaId, String criteriaName, 
                          String criteriaDescription, Double maxScore, Double score, Double weight, 
                          String feedback, String gradedBy, LocalDateTime gradedAt) {
        this.id = id;
        this.teamId = teamId;
        this.teamName = teamName;
        this.criteriaId = criteriaId;
        this.criteriaName = criteriaName;
        this.criteriaDescription = criteriaDescription;
        this.maxScore = maxScore;
        this.score = score;
        this.weight = weight;
        this.feedback = feedback;
        this.gradedBy = gradedBy;
        this.gradedAt = gradedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public Long getCriteriaId() { return criteriaId; }
    public void setCriteriaId(Long criteriaId) { this.criteriaId = criteriaId; }

    public String getCriteriaName() { return criteriaName; }
    public void setCriteriaName(String criteriaName) { this.criteriaName = criteriaName; }

    public String getCriteriaDescription() { return criteriaDescription; }
    public void setCriteriaDescription(String criteriaDescription) { this.criteriaDescription = criteriaDescription; }

    public Double getMaxScore() { return maxScore; }
    public void setMaxScore(Double maxScore) { this.maxScore = maxScore; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getGradedBy() { return gradedBy; }
    public void setGradedBy(String gradedBy) { this.gradedBy = gradedBy; }

    public LocalDateTime getGradedAt() { return gradedAt; }
    public void setGradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; }
}
