package com.collabsphere.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateClassRequest {
    @NotBlank(message = "Class name is required")
    private String name;

    @NotBlank(message = "Class code is required")
    private String code;

    public CreateClassRequest() {}

    public CreateClassRequest(String name, String code) {
        this.name = name;
        this.code = code;
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
}