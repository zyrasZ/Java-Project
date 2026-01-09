package com.collabsphere.controller;

import com.collabsphere.dto.ApiResponse;
import com.collabsphere.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/staff")
@PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
public class StaffController {

    @Autowired
    private StaffService staffService;

    @PostMapping("/import/users")
    public ResponseEntity<ApiResponse<String>> importUsers(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("File không được để trống"));
            }

            String result = staffService.importUsersFromExcel(file);
            return ResponseEntity.ok(ApiResponse.success("Import thành công", result));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Lỗi import: " + e.getMessage()));
        }
    }

    @PostMapping("/import/classrooms")
    public ResponseEntity<ApiResponse<String>> importClassrooms(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("File không được để trống"));
            }

            String result = staffService.importClassroomsFromExcel(file);
            return ResponseEntity.ok(ApiResponse.success("Import lớp học thành công", result));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Lỗi import lớp học: " + e.getMessage()));
        }
    }
}