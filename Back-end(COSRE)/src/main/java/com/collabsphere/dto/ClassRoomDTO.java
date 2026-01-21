package com.collabsphere.dto;

import com.collabsphere.entity.ClassRoom;
import com.collabsphere.entity.User;

import java.util.List;
import java.util.stream.Collectors;

public class ClassRoomDTO {
    private Long id;
    private String name;
    private String code;
    private Long lecturerId;
    private String lecturerName;
    private String lecturerEmail;
    private List<StudentDTO> students;

    // Constructors
    public ClassRoomDTO() {}

    public ClassRoomDTO(ClassRoom classRoom) {
        this.id = classRoom.getId();
        this.name = classRoom.getName();
        this.code = classRoom.getCode();
        
        if (classRoom.getLecturer() != null) {
            this.lecturerId = classRoom.getLecturer().getId();
            this.lecturerName = classRoom.getLecturer().getFullName();
            this.lecturerEmail = classRoom.getLecturer().getEmail();
        }
        
        if (classRoom.getStudents() != null) {
            this.students = classRoom.getStudents().stream()
                .map(StudentDTO::new)
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
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

    public List<StudentDTO> getStudents() {
        return students;
    }

    public void setStudents(List<StudentDTO> students) {
        this.students = students;
    }

    // Inner class for Student DTO
    public static class StudentDTO {
        private Long id;
        private String fullName;
        private String email;

        public StudentDTO() {}

        public StudentDTO(User student) {
            this.id = student.getId();
            this.fullName = student.getFullName();
            this.email = student.getEmail();
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