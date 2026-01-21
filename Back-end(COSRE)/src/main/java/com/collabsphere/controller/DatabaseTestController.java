package com.collabsphere.controller;

import com.collabsphere.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/database")
public class DatabaseTestController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/test")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testDatabaseConnection() {
        Map<String, Object> result = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            result.put("connected", true);
            result.put("database", connection.getCatalog());
            result.put("url", connection.getMetaData().getURL());
            result.put("driver", connection.getMetaData().getDriverName());
            result.put("version", connection.getMetaData().getDatabaseProductVersion());
            
            return ResponseEntity.ok(ApiResponse.success("Database connection successful", result));
        } catch (Exception e) {
            result.put("connected", false);
            result.put("error", e.getMessage());
            
            return ResponseEntity.ok(ApiResponse.error("Database connection failed", result));
        }
    }
}