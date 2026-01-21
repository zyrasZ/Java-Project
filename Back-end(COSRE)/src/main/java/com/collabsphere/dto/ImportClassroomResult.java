package com.collabsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportClassroomResult {
    private int totalRows;
    private int createdClassrooms;
    private int skippedClassrooms;
    private List<String> errors;
    private List<ImportedClassroomInfo> importedClassrooms;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportedClassroomInfo {
        private Long id;
        private String name;
        private String code;
        private String lecturerName;
        private String lecturerEmail;
    }
}
