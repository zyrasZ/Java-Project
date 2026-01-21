package com.collabsphere.controller;

import com.collabsphere.dto.*;
import com.collabsphere.entity.User;
import com.collabsphere.entity.enums.UserRole;
import com.collabsphere.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<User>>> getAllUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        try {
            Page<User> users = userService.getAllUsers(keyword, role, active, page, size, sortBy, sortDirection);
            return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to retrieve users: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to retrieve user: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            User user = userService.createUser(request);
            return ResponseEntity.ok(ApiResponse.success("User created successfully", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to create user: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateUserRequest request) {
        try {
            User user = userService.updateUser(id, request);
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to update user: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully", "User has been deactivated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to delete user: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<ApiResponse<String>> permanentDeleteUser(@PathVariable Long id) {
        try {
            userService.permanentDeleteUser(id);
            return ResponseEntity.ok(ApiResponse.success("User permanently deleted", "User has been permanently removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to permanently delete user: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<User>> changeUserRole(
            @PathVariable Long id, 
            @Valid @RequestBody ChangeRoleRequest request) {
        try {
            User user = userService.changeUserRole(id, request);
            return ResponseEntity.ok(ApiResponse.success("User role changed successfully", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to change user role: " + e.getMessage()));
        }
    }
    @PutMapping("/{id}/password")
    public ResponseEntity<ApiResponse<User>> changeUserPassword(
            @PathVariable Long id, 
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            User user = userService.changeUserPassword(id, request);
            return ResponseEntity.ok(ApiResponse.success("User password changed successfully", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to change user password: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<User>> toggleUserStatus(@PathVariable Long id) {
        try {
            User user = userService.toggleUserStatus(id);
            return ResponseEntity.ok(ApiResponse.success("User status toggled successfully", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to toggle user status: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<User>>> searchUsers(@RequestParam String q) {
        try {
            List<User> users = userService.searchUsers(q);
            return ResponseEntity.ok(ApiResponse.success("Users found", users));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to search users: " + e.getMessage()));
        }
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<User>>> getUsersByRole(
            @PathVariable UserRole role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<User> users = userService.getUsersByRole(role, page, size);
            return ResponseEntity.ok(ApiResponse.success("Users retrieved by role", users));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to retrieve users by role: " + e.getMessage()));
        }
    }

    @GetMapping("/role/{role}/active")
    public ResponseEntity<ApiResponse<List<User>>> getActiveUsersByRole(@PathVariable UserRole role) {
        try {
            List<User> users = userService.getActiveUsersByRole(role);
            return ResponseEntity.ok(ApiResponse.success("Active users retrieved by role", users));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to retrieve active users by role: " + e.getMessage()));
        }
    }
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<UserStatisticsResponse>> getUserStatistics() {
        try {
            UserStatisticsResponse statistics = userService.getUserStatistics();
            return ResponseEntity.ok(ApiResponse.success("User statistics retrieved", statistics));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to retrieve user statistics: " + e.getMessage()));
        }
    }

    @PutMapping("/bulk/status")
    public ResponseEntity<ApiResponse<BulkUpdateResult>> bulkUpdateStatus(
            @Valid @RequestBody BulkUpdateStatusRequest request) {
        try {
            BulkUpdateResult result = userService.bulkUpdateStatus(request);
            return ResponseEntity.ok(ApiResponse.success("Bulk update completed", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to bulk update status: " + e.getMessage()));
        }
    }

    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<String>>> getAllRoles() {
        try {
            List<String> roles = userService.getAllRoles();
            return ResponseEntity.ok(ApiResponse.success("User roles retrieved", roles));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to retrieve user roles: " + e.getMessage()));
        }
    }
}