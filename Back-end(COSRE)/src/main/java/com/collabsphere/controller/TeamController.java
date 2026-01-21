package com.collabsphere.controller;

import com.collabsphere.dto.ApiResponse;
import com.collabsphere.dto.AutoGenerateTeamsRequest;
import com.collabsphere.dto.TeamDTO;
import com.collabsphere.entity.Team;
import com.collabsphere.entity.User;
import com.collabsphere.entity.Project;
import com.collabsphere.repository.UserRepository;
import com.collabsphere.repository.ProjectRepository;
import com.collabsphere.repository.TeamRepository;
import com.collabsphere.security.UserPrincipal;
import com.collabsphere.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    @Autowired
    private TeamService teamService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TeamRepository teamRepository;

    @PostMapping("/auto-generate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<ApiResponse<List<Team>>> autoGenerateTeams(
            @Valid @RequestBody AutoGenerateTeamsRequest request,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<Team> teams = teamService.autoGenerateTeams(request, user);
            return ResponseEntity.ok(ApiResponse.success(
                "Teams generated successfully. Created " + teams.size() + " teams.", teams));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to generate teams: " + e.getMessage()));
        }
    }

    @GetMapping("/project/{projectId}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Team>>> getTeamsByProject(@PathVariable Long projectId) {
        try {
            List<Team> teams = teamService.getTeamsByProject(projectId);
            return ResponseEntity.ok(ApiResponse.success("Teams retrieved successfully", teams));
        } catch (Exception e) {
            e.printStackTrace(); // Add logging for debugging
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get teams: " + e.getMessage()));
        }
    }

    @GetMapping("/my")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Team>>> getMyTeams(Authentication authentication) {
        try {
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Authentication required"));
            }
            
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            if (userPrincipal.getId() == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("User ID not found"));
            }
            
            List<Team> teams = teamService.getTeamsByUser(userPrincipal.getId());
            return ResponseEntity.ok(ApiResponse.success("Teams retrieved successfully", teams));
        } catch (Exception e) {
            e.printStackTrace(); // Add logging for debugging
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get teams: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Team>> getTeamById(@PathVariable Long id) {
        try {
            Team team = teamService.getTeamById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));
            return ResponseEntity.ok(ApiResponse.success("Team retrieved successfully", team));
        } catch (Exception e) {
            e.printStackTrace(); // Add logging for debugging
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get team: " + e.getMessage()));
        }
    }

    @GetMapping("/debug/teams")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Team>>> getAllTeamsForDebug() {
        try {
            System.out.println("=== DEBUG: Getting all teams for debugging ===");
            List<Team> teams = teamRepository.findAll();
            System.out.println("Found " + teams.size() + " teams:");
            for (Team team : teams) {
                System.out.println("  Team ID: " + team.getId() + ", Name: " + team.getName());
            }
            return ResponseEntity.ok(ApiResponse.success("Teams retrieved for debugging", teams));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get teams: " + e.getMessage()));
        }
    }

    @GetMapping("/debug/teams/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<TeamDTO>> getTeamForDebug(@PathVariable Long id) {
        try {
            System.out.println("=== DEBUG: Getting team " + id + " for debugging ===");
            Optional<Team> teamOpt = teamRepository.findByIdWithFullDetails(id);
            if (teamOpt.isEmpty()) {
                System.out.println("Team not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
            
            Team team = teamOpt.get();
            System.out.println("Team found: " + team.getName());
            System.out.println("Project: " + (team.getProject() != null ? team.getProject().getTitle() : "NULL"));
            System.out.println("Classroom: " + (team.getProject() != null && team.getProject().getClassRoom() != null ? team.getProject().getClassRoom().getName() : "NULL"));
            System.out.println("Members count: " + team.getMembers().size());
            System.out.println("Classroom students count: " + (team.getProject() != null && team.getProject().getClassRoom() != null ? team.getProject().getClassRoom().getStudents().size() : "NULL"));
            
            TeamDTO dto = new TeamDTO(team);
            return ResponseEntity.ok(ApiResponse.success("Team retrieved for debugging", dto));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get team: " + e.getMessage()));
        }
    }

    @GetMapping("/debug/users")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<User>>> getAllUsersForDebug() {
        try {
            System.out.println("=== DEBUG: Getting all users for debugging ===");
            List<User> users = userRepository.findAll();
            System.out.println("Found " + users.size() + " users:");
            for (User user : users) {
                System.out.println("  User ID: " + user.getId() + ", Name: " + user.getFullName() + ", Role: " + user.getRole());
            }
            return ResponseEntity.ok(ApiResponse.success("Users retrieved for debugging", users));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get users: " + e.getMessage()));
        }
    }

    @PostMapping("/debug/create-test-team")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    @Transactional
    public ResponseEntity<ApiResponse<TeamDTO>> createTestTeam(Authentication authentication) {
        try {
            System.out.println("=== DEBUG: Creating test team ===");
            
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Find the first available project
            List<Project> projects = projectRepository.findAll();
            if (projects.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No projects found. Create a project first."));
            }
            
            Project project = projects.get(0);
            System.out.println("Using project: " + project.getTitle());
            
            // Create a simple test team
            Team team = new Team();
            team.setName("Test Team for Debugging");
            team.setProject(project);
            
            Team savedTeam = teamRepository.save(team);
            System.out.println("Test team created with ID: " + savedTeam.getId());
            
            TeamDTO dto = new TeamDTO(savedTeam);
            return ResponseEntity.ok(ApiResponse.success("Test team created", dto));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to create test team: " + e.getMessage()));
        }
    }

    @PostMapping("/{teamId}/members/{userId}/dto")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    @Transactional
    public ResponseEntity<ApiResponse<TeamDTO>> addMemberToTeamAsDTO(
            @PathVariable Long teamId,
            @PathVariable Long userId) {
        try {
            System.out.println("=== DEBUG: TeamController.addMemberToTeamAsDTO START ===");
            
            TeamDTO team = teamService.addMemberToTeamAsDTO(teamId, userId);
            
            System.out.println("Member added successfully (DTO)");
            System.out.println("=== DEBUG: TeamController.addMemberToTeamAsDTO SUCCESS ===");
            
            return ResponseEntity.ok(ApiResponse.success("Member added to team successfully", team));
        } catch (Exception e) {
            System.out.println("=== DEBUG: TeamController.addMemberToTeamAsDTO ERROR ===");
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to add member: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{teamId}/members/{userId}/dto")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    @Transactional
    public ResponseEntity<ApiResponse<TeamDTO>> removeMemberFromTeamAsDTO(
            @PathVariable Long teamId,
            @PathVariable Long userId) {
        try {
            System.out.println("=== DEBUG: TeamController.removeMemberFromTeamAsDTO START ===");
            
            TeamDTO team = teamService.removeMemberFromTeamAsDTO(teamId, userId);
            
            System.out.println("Member removed successfully (DTO)");
            System.out.println("=== DEBUG: TeamController.removeMemberFromTeamAsDTO SUCCESS ===");
            
            return ResponseEntity.ok(ApiResponse.success("Member removed from team successfully", team));
        } catch (Exception e) {
            System.out.println("=== DEBUG: TeamController.removeMemberFromTeamAsDTO ERROR ===");
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to remove member: " + e.getMessage()));
        }
    }

    @PostMapping("/{teamId}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    @Transactional
    public ResponseEntity<ApiResponse<Team>> addMemberToTeam(
            @PathVariable Long teamId,
            @PathVariable Long userId) {
        try {
            System.out.println("=== DEBUG: TeamController.addMemberToTeam START ===");
            System.out.println("Team ID: " + teamId + ", User ID: " + userId);
            
            Team team = teamService.addMemberToTeam(teamId, userId);
            
            System.out.println("Member added successfully to team: " + team.getName());
            System.out.println("=== DEBUG: TeamController.addMemberToTeam SUCCESS ===");
            
            return ResponseEntity.ok(ApiResponse.success("Member added to team successfully", team));
        } catch (Exception e) {
            System.out.println("=== DEBUG: TeamController.addMemberToTeam ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to add member: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    @Transactional
    public ResponseEntity<ApiResponse<Team>> removeMemberFromTeam(
            @PathVariable Long teamId,
            @PathVariable Long userId) {
        try {
            System.out.println("=== DEBUG: TeamController.removeMemberFromTeam START ===");
            System.out.println("Team ID: " + teamId + ", User ID: " + userId);
            
            Team team = teamService.removeMemberFromTeam(teamId, userId);
            
            System.out.println("Member removed successfully from team: " + team.getName());
            System.out.println("=== DEBUG: TeamController.removeMemberFromTeam SUCCESS ===");
            
            return ResponseEntity.ok(ApiResponse.success("Member removed from team successfully", team));
        } catch (Exception e) {
            System.out.println("=== DEBUG: TeamController.removeMemberFromTeam ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to remove member: " + e.getMessage()));
        }
    }

    @DeleteMapping("/project/{projectId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<ApiResponse<String>> deleteTeamsByProject(@PathVariable Long projectId) {
        try {
            teamService.deleteTeamsByProject(projectId);
            return ResponseEntity.ok(ApiResponse.success("All teams deleted successfully", "Teams deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to delete teams: " + e.getMessage()));
        }
    }

    @PostMapping("/{teamId}/grade")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<ApiResponse<Team>> gradeTeam(
            @PathVariable Long teamId,
            @RequestBody GradeRequest request,
            Authentication authentication) {
        try {
            Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
            
            team.setGrade(request.getScore());
            team.setFeedback(request.getFeedback());
            
            Team savedTeam = teamRepository.save(team);
            return ResponseEntity.ok(ApiResponse.success("Team graded successfully", savedTeam));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to grade team: " + e.getMessage()));
        }
    }

    // DTO for grading
    public static class GradeRequest {
        private Double score;
        private String feedback;

        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }
        public String getFeedback() { return feedback; }
        public void setFeedback(String feedback) { this.feedback = feedback; }
    }
}