package com.collabsphere.controller;

import com.collabsphere.dto.*;
import com.collabsphere.entity.Task;
import com.collabsphere.entity.User;
import com.collabsphere.entity.enums.TaskStatus;
import com.collabsphere.repository.UserRepository;
import com.collabsphere.security.UserPrincipal;
import com.collabsphere.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<Task>> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Task task = taskService.createTask(request, user);
            return ResponseEntity.ok(ApiResponse.success("Task created successfully", task));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to create task: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Task>> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Task task = taskService.updateTaskStatus(id, request, user);
            return ResponseEntity.ok(ApiResponse.success("Task status updated successfully", task));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to update task status: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<Task>> assignTask(
            @PathVariable Long id,
            @Valid @RequestBody AssignTaskRequest request,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Task task = taskService.assignTask(id, request, user);
            return ResponseEntity.ok(ApiResponse.success("Task assigned successfully", task));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to assign task: " + e.getMessage()));
        }
    }

    @GetMapping("/teams/{teamId}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Task>>> getTasksByTeam(
            @PathVariable Long teamId,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<Task> tasks = taskService.getTasksByTeam(teamId, user);
            return ResponseEntity.ok(ApiResponse.success("Tasks retrieved successfully", tasks));
        } catch (Exception e) {
            e.printStackTrace(); // Add logging for debugging
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get tasks: " + e.getMessage()));
        }
    }

    @GetMapping("/teams/{teamId}/kanban")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<KanbanBoardResponse>> getKanbanBoard(
            @PathVariable Long teamId,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            KanbanBoardResponse kanbanBoard = taskService.getKanbanBoard(teamId, user);
            return ResponseEntity.ok(ApiResponse.success("Kanban board retrieved successfully", kanbanBoard));
        } catch (Exception e) {
            e.printStackTrace(); // Add logging for debugging
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get kanban board: " + e.getMessage()));
        }
    }

    @GetMapping("/teams/{teamId}/status/{status}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Task>>> getTasksByTeamAndStatus(
            @PathVariable Long teamId,
            @PathVariable TaskStatus status,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<Task> tasks = taskService.getTasksByTeamAndStatus(teamId, status, user);
            return ResponseEntity.ok(ApiResponse.success("Tasks retrieved successfully", tasks));
        } catch (Exception e) {
            e.printStackTrace(); // Add logging for debugging
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get tasks: " + e.getMessage()));
        }
    }

    @GetMapping("/my/dto")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<TaskDTO>>> getMyTasksAsDTO(Authentication authentication) {
        try {
            System.out.println("=== DEBUG: TaskController.getMyTasksAsDTO START ===");
            
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Authentication required"));
            }
            
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<TaskDTO> tasks = taskService.getMyTasksAsDTO(user);
            return ResponseEntity.ok(ApiResponse.success("My tasks retrieved successfully", tasks));
        } catch (Exception e) {
            System.out.println("=== DEBUG: TaskController.getMyTasksAsDTO ERROR ===");
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get my tasks: " + e.getMessage()));
        }
    }

    @GetMapping("/my")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Task>>> getMyTasks(Authentication authentication) {
        try {
            System.out.println("=== DEBUG: TaskController.getMyTasks START ===");
            
            if (authentication == null || authentication.getPrincipal() == null) {
                System.out.println("ERROR: Authentication is null");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Authentication required"));
            }
            
            System.out.println("Authentication type: " + authentication.getClass().getSimpleName());
            System.out.println("Principal type: " + authentication.getPrincipal().getClass().getSimpleName());
            
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            if (userPrincipal.getId() == null) {
                System.out.println("ERROR: User ID is null");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("User ID not found"));
            }
            
            System.out.println("UserPrincipal ID: " + userPrincipal.getId());
            
            System.out.println("Step 1: Finding user in database...");
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            System.out.println("User found: " + user.getEmail());
            
            System.out.println("Step 2: Calling taskService.getMyTasks...");
            List<Task> tasks = taskService.getMyTasks(user);
            System.out.println("TaskService returned " + tasks.size() + " tasks");
            
            System.out.println("Step 3: Creating response...");
            ApiResponse<List<Task>> response = ApiResponse.success("My tasks retrieved successfully", tasks);
            System.out.println("Response created successfully");
            
            System.out.println("Step 4: Returning ResponseEntity...");
            ResponseEntity<ApiResponse<List<Task>>> result = ResponseEntity.ok(response);
            System.out.println("=== DEBUG: TaskController.getMyTasks SUCCESS ===");
            
            return result;
            
        } catch (Exception e) {
            System.out.println("=== DEBUG: TaskController.getMyTasks ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get my tasks: " + e.getMessage()));
        }
    }

    @GetMapping("/my/status/{status}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Task>>> getMyTasksByStatus(
            @PathVariable TaskStatus status,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Authentication required"));
            }
            
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<Task> tasks = taskService.getMyTasksByStatus(user, status);
            return ResponseEntity.ok(ApiResponse.success("My tasks retrieved successfully", tasks));
        } catch (Exception e) {
            e.printStackTrace(); // Add logging for debugging
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get my tasks: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Task>> getTaskById(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Optional<Task> task = taskService.getTaskById(id, user);
            if (task.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("Task retrieved successfully", task.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace(); // Add logging for debugging
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get task: " + e.getMessage()));
        }
    }

    @GetMapping("/teams/{teamId}/overdue")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Task>>> getOverdueTasks(
            @PathVariable Long teamId,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<Task> tasks = taskService.getOverdueTasks(teamId, user);
            return ResponseEntity.ok(ApiResponse.success("Overdue tasks retrieved successfully", tasks));
        } catch (Exception e) {
            e.printStackTrace(); // Add logging for debugging
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get overdue tasks: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Task>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Task task = taskService.updateTask(id, request, user);
            return ResponseEntity.ok(ApiResponse.success("Task updated successfully", task));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to update task: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteTask(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            taskService.deleteTask(id, user);
            return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", "Task deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to delete task: " + e.getMessage()));
        }
    }
}