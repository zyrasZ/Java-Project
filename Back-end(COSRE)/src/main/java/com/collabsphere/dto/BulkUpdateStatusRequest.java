package com.collabsphere.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class BulkUpdateStatusRequest {
    @NotEmpty(message = "User IDs list cannot be empty")
    private List<Long> userIds;

    @NotNull(message = "Active status is required")
    private Boolean active;

    public BulkUpdateStatusRequest() {}

    public BulkUpdateStatusRequest(List<Long> userIds, Boolean active) {
        this.userIds = userIds;
        this.active = active;
    }

    public List<Long> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<Long> userIds) {
        this.userIds = userIds;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}