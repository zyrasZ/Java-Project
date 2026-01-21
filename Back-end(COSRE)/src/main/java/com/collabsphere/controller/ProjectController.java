package com.collabsphere.controller;

import com.collabsphere.dto.ApiResponse;
import com.collabsphere.dto.CreateMilestoneRequest;
import com.collabsphere.dto.CreateProjectRequest;
import com.collabsphere.dto.ProjectDTO;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
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
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Project>>> getProjectsByClassroom(@PathVariable Long classroomId) {
        try {
            List<Project> projects = projectService.getProjectsByClassroom(classroomId);
            return ResponseEntity.ok(ApiResponse.success("Projects retrieved successfully", projects));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get projects: " + e.getMessage()));
        }
    }

    @GetMapping("/my/dto")
    @PreAuthorize("hasRole('LECTURER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<ProjectDTO>>> getMyProjectsAsDTO(Authentication authentication) {
        try {
            System.out.println("=== DEBUG: ProjectController.getMyProjectsAsDTO START ===");
            
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Authentication required"));
            }
            
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User lecturer = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<ProjectDTO> projects = projectService.getProjectsByLecturerAsDTO(lecturer);
            return ResponseEntity.ok(ApiResponse.success("My projects retrieved successfully", projects));
        } catch (Exception e) {
            System.out.println("=== DEBUG: ProjectController.getMyProjectsAsDTO ERROR ===");
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get my projects: " + e.getMessage()));
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('LECTURER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Project>>> getMyProjects(Authentication authentication) {
        try {
            System.out.println("=== DEBUG: ProjectController.getMyProjects START ===");
            
            if (authentication == null || authentication.getPrincipal() == null) {
                System.out.println("ERROR: Authentication is null");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Authentication required"));
            }
            
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            if (userPrincipal.getId() == null) {
                System.out.println("ERROR: User ID is null");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("User ID not found"));
            }
            
            System.out.println("UserPrincipal ID: " + userPrincipal.getId());
            
            System.out.println("Step 1: Finding user in database...");
            User lecturer = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            System.out.println("User found: " + lecturer.getEmail() + ", Role: " + lecturer.getRole());
            
            System.out.println("Step 2: Calling projectService.getProjectsByLecturer...");
            List<Project> projects = projectService.getProjectsByLecturer(lecturer);
            System.out.println("ProjectService returned " + projects.size() + " projects");
            
            System.out.println("Step 3: Creating response...");
            ApiResponse<List<Project>> response = ApiResponse.success("Projects retrieved successfully", projects);
            System.out.println("Response created successfully");
            
            System.out.println("=== DEBUG: ProjectController.getMyProjects SUCCESS ===");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("=== DEBUG: ProjectController.getMyProjects ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get projects: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
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

    @GetMapping("/pending")
    @PreAuthorize("hasRole('HEAD_DEPARTMENT') or hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Project>>> getPendingProjects() {
        try {
            List<Project> projects = projectService.getPendingProjects();
            return ResponseEntity.ok(ApiResponse.success("Pending projects retrieved successfully", projects));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get pending projects: " + e.getMessage()));
        }
    }

    @GetMapping("/approved")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Project>>> getApprovedProjects() {
        try {
            List<Project> projects = projectService.getApprovedProjects();
            return ResponseEntity.ok(ApiResponse.success("Approved projects retrieved successfully", projects));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get approved projects: " + e.getMessage()));
        }
    }
}