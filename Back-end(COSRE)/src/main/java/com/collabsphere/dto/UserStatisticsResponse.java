package com.collabsphere.dto;

import java.util.Map;

public class UserStatisticsResponse {
    private Map<String, Long> byRole;
    private Map<String, Long> byStatus;
    private Long total;

    public UserStatisticsResponse() {}

    public UserStatisticsResponse(Map<String, Long> byRole, Map<String, Long> byStatus, Long total) {
        this.byRole = byRole;
        this.byStatus = byStatus;
        this.total = total;
    }

    public Map<String, Long> getByRole() {
        return byRole;
    }

    public void setByRole(Map<String, Long> byRole) {
        this.byRole = byRole;
    }

    public Map<String, Long> getByStatus() {
        return byStatus;
    }

    public void setByStatus(Map<String, Long> byStatus) {
        this.byStatus = byStatus;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }
}