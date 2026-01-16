package com.collabsphere.service;

import com.collabsphere.dto.AssignTaskRequest;
import com.collabsphere.dto.CreateTaskRequest;
import com.collabsphere.dto.KanbanBoardResponse;
import com.collabsphere.dto.TaskDTO;
import com.collabsphere.dto.UpdateTaskStatusRequest;
import com.collabsphere.entity.Task;
import com.collabsphere.entity.Team;
import com.collabsphere.entity.User;
import com.collabsphere.entity.enums.TaskStatus;
import com.collabsphere.entity.enums.UserRole;
import com.collabsphere.repository.TaskRepository;
import com.collabsphere.repository.TeamRepository;
import com.collabsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private UserRepository userRepository;

    public Task createTask(CreateTaskRequest request, User creator) {
        // Find team
        Team team = teamRepository.findById(request.getTeamId())
            .orElseThrow(() -> new RuntimeException("Team not found"));

        // Check if user is a member of the team or has permission
        if (!isTeamMemberOrHasPermission(creator, team)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You are not a member of this team");
        }

        // Validate assignee if provided
        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                .orElseThrow(() -> new RuntimeException("Assignee not found"));
            
            // Check if assignee is a team member
            if (!team.getMembers().contains(assignee)) {
                throw new RuntimeException("Assignee must be a member of the team");
            }
        }

        // Validate due date if provided
        if (request.getDueDate() != null && request.getDueDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Due date cannot be in the past");
        }

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setTeam(team);
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setAssignee(assignee);
        task.setStatus(TaskStatus.TODO); // Default status

        return taskRepository.save(task);
    }

    public Task updateTaskStatus(Long taskId, UpdateTaskStatusRequest request, User user) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));

        // Check if user is a member of the team
        if (!isTeamMemberOrHasPermission(user, task.getTeam())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You are not a member of this team");
        }

        task.setStatus(request.getNewStatus());
        return taskRepository.save(task);
    }

    public Task assignTask(Long taskId, AssignTaskRequest request, User user) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));

        // Check if user is a member of the team
        if (!isTeamMemberOrHasPermission(user, task.getTeam())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You are not a member of this team");
        }

        // Find assignee
        User assignee = userRepository.findById(request.getAssigneeId())
            .orElseThrow(() -> new RuntimeException("Assignee not found"));

        // Check if assignee is a team member
        if (!task.getTeam().getMembers().contains(assignee)) {
            throw new RuntimeException("Assignee must be a member of the team");
        }

        task.setAssignee(assignee);
        return taskRepository.save(task);
    }

    @Transactional(readOnly = true)
    public List<Task> getTasksByTeam(Long teamId, User user) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));

        // Check if user is a member of the team or has permission
        if (!isTeamMemberOrHasPermission(user, team)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You are not a member of this team");
        }

        return taskRepository.findByTeamIdOrderByPriorityDesc(teamId);
    }

    @Transactional(readOnly = true)
    public List<Task> getTasksByTeamAndStatus(Long teamId, TaskStatus status, User user) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));

        // Check if user is a member of the team
        if (!isTeamMemberOrHasPermission(user, team)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You are not a member of this team");
        }

        return taskRepository.findByTeamIdAndStatus(teamId, status);
    }

    @Transactional(readOnly = true)
    public List<Task> getMyTasks(User user) {
        try {
            System.out.println("=== DEBUG: getMyTasks START ===");
            System.out.println("User ID: " + user.getId());
            
            // Use simple query first
            List<Task> tasks = taskRepository.findByAssigneeIdSimple(user.getId());
            System.out.println("Simple query returned " + tasks.size() + " tasks");
            
            System.out.println("=== DEBUG: getMyTasks SUCCESS ===");
            return tasks;
            
        } catch (Exception e) {
            System.out.println("=== DEBUG: getMyTasks ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<TaskDTO> getMyTasksAsDTO(User user) {
        try {
            System.out.println("=== DEBUG: getMyTasksAsDTO START ===");
            
            // Use simple query to avoid FETCH JOIN issues
            List<Task> tasks = taskRepository.findByAssigneeIdSimple(user.getId());
            System.out.println("Found " + tasks.size() + " tasks");
            
            List<TaskDTO> taskDTOs = new ArrayList<>();
            for (Task task : tasks) {
                System.out.println("Processing task: " + task.getId());
                
                TaskDTO dto = new TaskDTO();
                dto.setId(task.getId());
                dto.setTitle(task.getTitle());
                dto.setDescription(task.getDescription());
                dto.setStatus(task.getStatus());
                dto.setPriority(task.getPriority());
                dto.setDueDate(task.getDueDate());
                
                // Safely access team info
                if (task.getTeam() != null) {
                    dto.setTeamId(task.getTeam().getId());
                    dto.setTeamName(task.getTeam().getName());
                }
                
                // Safely access assignee info
                if (task.getAssignee() != null) {
                    dto.setAssigneeId(task.getAssignee().getId());
                    dto.setAssigneeName(task.getAssignee().getFullName());
                    dto.setAssigneeEmail(task.getAssignee().getEmail());
                }
                
                taskDTOs.add(dto);
                System.out.println("Added DTO for task: " + task.getId());
            }
            
            System.out.println("=== DEBUG: getMyTasksAsDTO SUCCESS ===");
            return taskDTOs;
            
        } catch (Exception e) {
            System.out.println("=== DEBUG: getMyTasksAsDTO ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<Task> getMyTasksByStatus(User user, TaskStatus status) {
        return taskRepository.findByAssigneeIdAndStatus(user.getId(), status);
    }

    @Transactional(readOnly = true)
    public Optional<Task> getTaskById(Long taskId, User user) {
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            // Check if user is a member of the team
            if (!isTeamMemberOrHasPermission(user, task.getTeam())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "You are not a member of this team");
            }
        }
        
        return taskOpt;
    }

    @Transactional(readOnly = true)
    public List<Task> getOverdueTasks(Long teamId, User user) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));

        // Check if user is a member of the team
        if (!isTeamMemberOrHasPermission(user, team)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You are not a member of this team");
        }

        return taskRepository.findOverdueTasksByTeam(teamId, LocalDateTime.now());
    }

    public Task updateTask(Long taskId, CreateTaskRequest request, User user) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));

        // Check if user is a member of the team
        if (!isTeamMemberOrHasPermission(user, task.getTeam())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You are not a member of this team");
        }

        // Update fields
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());

        // Update assignee if provided
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                .orElseThrow(() -> new RuntimeException("Assignee not found"));
            
            if (!task.getTeam().getMembers().contains(assignee)) {
                throw new RuntimeException("Assignee must be a member of the team");
            }
            task.setAssignee(assignee);
        }

        return taskRepository.save(task);
    }

    public void deleteTask(Long taskId, User user) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));

        // Check if user is a member of the team
        if (!isTeamMemberOrHasPermission(user, task.getTeam())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You are not a member of this team");
        }

        taskRepository.delete(task);
    }

    @Transactional(readOnly = true)
    public KanbanBoardResponse getKanbanBoard(Long teamId, User user) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));

        // Check if user is a member of the team
        if (!isTeamMemberOrHasPermission(user, team)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You are not a member of this team");
        }

        List<Task> todoTasks = taskRepository.findByTeamIdAndStatus(teamId, TaskStatus.TODO);
        List<Task> doingTasks = taskRepository.findByTeamIdAndStatus(teamId, TaskStatus.DOING);
        List<Task> doneTasks = taskRepository.findByTeamIdAndStatus(teamId, TaskStatus.DONE);

        return new KanbanBoardResponse(todoTasks, doingTasks, doneTasks, teamId, team.getName());
    }

    /**
     * Check if user is a team member or has permission (LECTURER/ADMIN)
     */
    private boolean isTeamMemberOrHasPermission(User user, Team team) {
        // Admins and lecturers have access to all teams
        if (user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.LECTURER) {
            return true;
        }
        
        // Check if user is a member of the team
        return team.getMembers().contains(user);
    }
}