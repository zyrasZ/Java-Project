package com.collabsphere.dto;

import com.collabsphere.entity.Team;
import com.collabsphere.entity.User;

import java.util.List;
import java.util.stream.Collectors;

public class TeamDTO {
    private Long id;
    private String name;
    private Long projectId;
    private String projectTitle;
    private Long classroomId;
    private String classroomName;
    private String classroomCode;
    private Long lecturerId;
    private String lecturerName;
    private List<MemberDTO> members;

    // Constructors
    public TeamDTO() {}

    public TeamDTO(Team team) {
        this.id = team.getId();
        this.name = team.getName();
        
        if (team.getProject() != null) {
            this.projectId = team.getProject().getId();
            this.projectTitle = team.getProject().getTitle();
            
            if (team.getProject().getClassRoom() != null) {
                this.classroomId = team.getProject().getClassRoom().getId();
                this.classroomName = team.getProject().getClassRoom().getName();
                this.classroomCode = team.getProject().getClassRoom().getCode();
                
                if (team.getProject().getClassRoom().getLecturer() != null) {
                    this.lecturerId = team.getProject().getClassRoom().getLecturer().getId();
                    this.lecturerName = team.getProject().getClassRoom().getLecturer().getFullName();
                }
            }
        }
        
        if (team.getMembers() != null) {
            this.members = team.getMembers().stream()
                .map(MemberDTO::new)
                .collect(Collectors.toList());
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public List<MemberDTO> getMembers() {
        return members;
    }

    public void setMembers(List<MemberDTO> members) {
        this.members = members;
    }

    // Inner class for Member DTO
    public static class MemberDTO {
        private Long id;
        private String fullName;
        private String email;

        public MemberDTO() {}

        public MemberDTO(User member) {
            this.id = member.getId();
            this.fullName = member.getFullName();
            this.email = member.getEmail();
        }

        // Getters and Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}