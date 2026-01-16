package com.collabsphere.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "whiteboard_data")
public class WhiteboardData {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
    
    @Column(columnDefinition = "TEXT")
    private String dataJson;

    // Constructors
    public WhiteboardData() {}

    public WhiteboardData(Team team, String dataJson) {
        this.team = team;
        this.dataJson = dataJson;
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

    public String getDataJson() {
        return dataJson;
    }

    public void setDataJson(String dataJson) {
        this.dataJson = dataJson;
    }
}