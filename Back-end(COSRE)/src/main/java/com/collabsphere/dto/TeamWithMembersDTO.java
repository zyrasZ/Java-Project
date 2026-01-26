package com.collabsphere.dto;

import com.collabsphere.entity.Team;
import com.collabsphere.entity.User;
import com.collabsphere.entity.Project;

import java.util.List;
import java.util.stream.Collectors;

public class TeamWithMembersDTO {
    private Long id;
    private String name;
    private Double grade;
    private String feedback;
    private ProjectDTO project;
    private List<UserDTO> members;

    public TeamWithMembersDTO() {}

    public TeamWithMembersDTO(Team team) {
        this.id = team.getId();
        this.name = team.getName();
        this.grade = team.getGrade();
        this.feedback = team.getFeedback();
        
        if (team.getProject() != null) {
            this.project = new ProjectDTO(team.getProject());
        }
        
        if (team.getMembers() != null) {
            this.members = team.getMembers().stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getGrade() { return grade; }
    public void setGrade(Double grade) { this.grade = grade; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public ProjectDTO getProject() { return project; }
    public void setProject(ProjectDTO project) { this.project = project; }

    public List<UserDTO> getMembers() { return members; }
    public void setMembers(List<UserDTO> members) { this.members = members; }

    // Inner UserDTO class
    public static class UserDTO {
        private Long id;
        private String email;
        private String fullName;
        private String phoneNumber;
        private String avatarUrl;

        public UserDTO() {}

        public UserDTO(User user) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.fullName = user.getFullName();
            this.phoneNumber = user.getPhoneNumber();
            this.avatarUrl = user.getAvatarUrl();
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }
}