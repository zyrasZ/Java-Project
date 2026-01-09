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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/tasks")
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
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get tasks: " + e.getMessage()));
        }
    }

    @GetMapping("/teams/{teamId}/kanban")
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
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get kanban board: " + e.getMessage()));
        }
    }

    @GetMapping("/teams/{teamId}/status/{status}")
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
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get tasks: " + e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Task>>> getMyTasks(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<Task> tasks = taskService.getMyTasks(user);
            return ResponseEntity.ok(ApiResponse.success("My tasks retrieved successfully", tasks));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get my tasks: " + e.getMessage()));
        }
    }

    @GetMapping("/my/status/{status}")
    public ResponseEntity<ApiResponse<List<Task>>> getMyTasksByStatus(
            @PathVariable TaskStatus status,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<Task> tasks = taskService.getMyTasksByStatus(user, status);
            return ResponseEntity.ok(ApiResponse.success("My tasks retrieved successfully", tasks));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get my tasks: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
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
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get task: " + e.getMessage()));
        }
    }

    @GetMapping("/teams/{teamId}/overdue")
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
            return ResponseEntity.badRequest()
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