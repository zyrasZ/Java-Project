package com.collabsphere.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateClassRequest {
    @NotBlank(message = "Class name is required")
    private String name;

    @NotBlank(message = "Class code is required")
    private String code;

    // Optional - only required when ADMIN creates classroom for another lecturer
    private Long lecturerId;

    public CreateClassRequest() {}

    public CreateClassRequest(String name, String code, Long lecturerId) {
        this.name = name;
        this.code = code;
        this.lecturerId = lecturerId;
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
}