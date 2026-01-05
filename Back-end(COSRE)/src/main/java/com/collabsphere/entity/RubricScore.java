package com.collabsphere.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rubric_scores")
public class RubricScore {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "criteria_id", nullable = false)
    private RubricCriteria criteria;
    
    @Column(nullable = false)
    private Double score;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by", nullable = false)
    private User gradedBy;
    
    @Column(nullable = false)
    private LocalDateTime gradedAt = LocalDateTime.now();

    // Constructors
    public RubricScore() {}

    public RubricScore(Team team, RubricCriteria criteria, Double score, String feedback, User gradedBy) {
        this.team = team;
        this.criteria = criteria;
        this.score = score;
        this.feedback = feedback;
        this.gradedBy = gradedBy;
        this.gradedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public RubricCriteria getCriteria() {
        return criteria;
    }

    public void setCriteria(RubricCriteria criteria) {
        this.criteria = criteria;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public User getGradedBy() {
        return gradedBy;
    }

    public void setGradedBy(User gradedBy) {
        this.gradedBy = gradedBy;
    }

    public LocalDateTime getGradedAt() {
        return gradedAt;
    }

    public void setGradedAt(LocalDateTime gradedAt) {
        this.gradedAt = gradedAt;
    }
}