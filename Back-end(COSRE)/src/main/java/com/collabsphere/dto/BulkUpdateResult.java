package com.collabsphere.dto;

public class BulkUpdateResult {
    private int success;
    private int failed;
    private int total;

    public BulkUpdateResult() {}

    public BulkUpdateResult(int success, int failed, int total) {
        this.success = success;
        this.failed = failed;
        this.total = total;
    }

    public int getSuccess() {
        return success;
    }

    public void setSuccess(int success) {
        this.success = success;
    }

    public int getFailed() {
        return failed;
    }

    public void setFailed(int failed) {
        this.failed = failed;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }
}