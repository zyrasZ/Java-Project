package com.collabsphere.controller;

import com.collabsphere.dto.ApiResponse;
import com.collabsphere.dto.CreateMilestoneRequest;
import com.collabsphere.dto.CreateProjectRequest;
import com.collabsphere.entity.Milestone;
import com.collabsphere.entity.Project;
import com.collabsphere.entity.User;
import com.collabsphere.repository.UserRepository;
import com.collabsphere.security.UserPrincipal;
import com.collabsphere.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")  // Bỏ /api vì context-path đã có
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<ApiResponse<Project>> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Project project = projectService.createProject(request, user);
            return ResponseEntity.ok(ApiResponse.success("Project created successfully", project));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to create project: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/milestones")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<ApiResponse<Milestone>> createMilestone(
            @PathVariable Long id,
            @Valid @RequestBody CreateMilestoneRequest request,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Milestone milestone = projectService.createMilestone(id, request, user);
            return ResponseEntity.ok(ApiResponse.success("Milestone created successfully", milestone));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to create milestone: " + e.getMessage()));
        }
    }

    @GetMapping("/classroom/{classroomId}")
    public ResponseEntity<ApiResponse<List<Project>>> getProjectsByClassroom(@PathVariable Long classroomId) {
        try {
            List<Project> projects = projectService.getProjectsByClassroom(classroomId);
            return ResponseEntity.ok(ApiResponse.success("Projects retrieved successfully", projects));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get projects: " + e.getMessage()));
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<ApiResponse<List<Project>>> getMyProjects(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User lecturer = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<Project> projects = projectService.getProjectsByLecturer(lecturer);
            return ResponseEntity.ok(ApiResponse.success("Projects retrieved successfully", projects));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get projects: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Project>> getProjectById(@PathVariable Long id) {
        try {
            Project project = projectService.getProjectById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
            return ResponseEntity.ok(ApiResponse.success("Project retrieved successfully", project));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get project: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/milestones")
    public ResponseEntity<ApiResponse<List<Milestone>>> getMilestonesByProject(@PathVariable Long id) {
        try {
            List<Milestone> milestones = projectService.getMilestonesByProject(id);
            return ResponseEntity.ok(ApiResponse.success("Milestones retrieved successfully", milestones));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get milestones: " + e.getMessage()));
        }
    }

    @GetMapping("/classroom/{classroomId}/active")
    public ResponseEntity<ApiResponse<List<Project>>> getActiveProjects(@PathVariable Long classroomId) {
        try {
            List<Project> projects = projectService.getActiveProjects(classroomId);
            return ResponseEntity.ok(ApiResponse.success("Active projects retrieved successfully", projects));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get active projects: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/milestones/upcoming")
    public ResponseEntity<ApiResponse<List<Milestone>>> getUpcomingMilestones(@PathVariable Long id) {
        try {
            List<Milestone> milestones = projectService.getUpcomingMilestones(id);
            return ResponseEntity.ok(ApiResponse.success("Upcoming milestones retrieved successfully", milestones));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get upcoming milestones: " + e.getMessage()));
        }
    }

    // APPROVAL FLOW APIs
    @PutMapping("/{id}/submit")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<ApiResponse<Project>> submitProject(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User lecturer = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Project project = projectService.submitProject(id, lecturer);
            return ResponseEntity.ok(ApiResponse.success("Project submitted for approval", project));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to submit project: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('HEAD_DEPARTMENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Project>> approveProject(
            @PathVariable Long id,
            @RequestParam(required = false) String comment,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User approver = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Project project = projectService.approveProject(id, approver, comment);
            return ResponseEntity.ok(ApiResponse.success("Project approved successfully", project));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to approve project: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('HEAD_DEPARTMENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Project>> rejectProject(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User rejector = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Project project = projectService.rejectProject(id, rejector, reason);
            return ResponseEntity.ok(ApiResponse.success("Project rejected", project));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to reject project: " + e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<ApiResponse<String>> testEndpoint() {
        try {
            return ResponseEntity.ok(ApiResponse.success("Project controller is working", "Test successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Test failed: " + e.getMessage()));
        }
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('HEAD_DEPARTMENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Project>>> getPendingProjects() {
        try {
            System.out.println("🔍 Getting pending projects...");
            List<Project> projects = projectService.getPendingProjects();
            System.out.println("📊 Found " + projects.size() + " pending projects");
            return ResponseEntity.ok(ApiResponse.success("Pending projects retrieved successfully", projects));
        } catch (Exception e) {
            System.err.println("❌ Error getting pending projects: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get pending projects: " + e.getMessage()));
        }
    }

    @GetMapping("/approved")
    public ResponseEntity<ApiResponse<List<Project>>> getApprovedProjects() {
        try {
            System.out.println("🔍 Getting approved projects...");
            List<Project> projects = projectService.getApprovedProjects();
            System.out.println("📊 Found " + projects.size() + " approved projects");
            return ResponseEntity.ok(ApiResponse.success("Approved projects retrieved successfully", projects));
        } catch (Exception e) {
            System.err.println("❌ Error getting approved projects: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get approved projects: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Project>>> getAllProjects() {
        try {
            System.out.println("🔍 Getting all projects...");
            List<Project> projects = projectService.getAllProjects();
            System.out.println("📊 Found " + projects.size() + " total projects");
            return ResponseEntity.ok(ApiResponse.success("All projects retrieved successfully", projects));
        } catch (Exception e) {
            System.err.println("❌ Error getting all projects: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get all projects: " + e.getMessage()));
        }
    }
}