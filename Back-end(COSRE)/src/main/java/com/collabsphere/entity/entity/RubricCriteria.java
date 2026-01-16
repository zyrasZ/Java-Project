package com.collabsphere.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "rubric_criteria")
public class RubricCriteria {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rubric_id", nullable = false)
    private Rubric rubric;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private Double weight; // Trọng số (VD: 0.3 cho 30%)
    
    @Column(nullable = false)
    private Double maxScore = 10.0; // Điểm tối đa
    
    // Quan hệ với RubricScore
    @OneToMany(mappedBy = "criteria", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<RubricScore> scores = new HashSet<>();

    // Constructors
    public RubricCriteria() {}

    public RubricCriteria(Rubric rubric, String name, String description, Double weight, Double maxScore) {
        this.rubric = rubric;
        this.name = name;
        this.description = description;
        this.weight = weight;
        this.maxScore = maxScore;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Rubric getRubric() {
        return rubric;
    }

    public void setRubric(Rubric rubric) {
        this.rubric = rubric;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public Double getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(Double maxScore) {
        this.maxScore = maxScore;
    }

    public Set<RubricScore> getScores() {
        return scores;
    }

    public void setScores(Set<RubricScore> scores) {
        this.scores = scores;
    }
}