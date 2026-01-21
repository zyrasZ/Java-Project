package com.collabsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportUserResult {
    private int totalRows;
    private int createdUsers;
    private int skippedUsers;
    private List<String> errors;
    private List<ImportedUserInfo> importedUsers;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportedUserInfo {
        private Long id;
        private String email;
        private String fullName;
        private String role;
        private boolean active;
    }
}
