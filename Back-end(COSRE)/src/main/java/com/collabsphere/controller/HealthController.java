package com.collabsphere.controller;

import com.collabsphere.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> healthInfo = new HashMap<>();
        
        try {
            // Check database connection
            try (Connection connection = dataSource.getConnection()) {
                healthInfo.put("database", "UP");
                healthInfo.put("databaseUrl", connection.getMetaData().getURL());
            }
        } catch (Exception e) {
            healthInfo.put("database", "DOWN");
            healthInfo.put("databaseError", e.getMessage());
        }
        
        healthInfo.put("status", "UP");
        healthInfo.put("timestamp", LocalDateTime.now());
        healthInfo.put("application", "CollabSphere");
        healthInfo.put("version", "1.0.0-FULL-SCOPE");
        
        return ResponseEntity.ok(ApiResponse.success("Application is healthy", healthInfo));
    }

    @GetMapping("/database/test")
    public ResponseEntity<ApiResponse<String>> testDatabase() {
        try (Connection connection = dataSource.getConnection()) {
            String url = connection.getMetaData().getURL();
            String driver = connection.getMetaData().getDriverName();
            
            return ResponseEntity.ok(ApiResponse.success(
                "Database connection successful", 
                "Connected to: " + url + " using " + driver
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Database connection failed: " + e.getMessage()));
        }
    }
}