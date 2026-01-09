package com.collabsphere.controller;

import com.collabsphere.dto.ApiResponse;
import com.collabsphere.dto.AutoGenerateTeamsRequest;
import com.collabsphere.entity.Team;
import com.collabsphere.entity.User;
import com.collabsphere.repository.UserRepository;
import com.collabsphere.security.UserPrincipal;
import com.collabsphere.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
public class TeamController {

    @Autowired
    private TeamService teamService;

    @Autowired
    private UserRepository userRepository;

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
    public ResponseEntity<ApiResponse<List<Team>>> getTeamsByProject(@PathVariable Long projectId) {
        try {
            List<Team> teams = teamService.getTeamsByProject(projectId);
            return ResponseEntity.ok(ApiResponse.success("Teams retrieved successfully", teams));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get teams: " + e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Team>>> getMyTeams(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            List<Team> teams = teamService.getTeamsByUser(userPrincipal.getId());
            return ResponseEntity.ok(ApiResponse.success("Teams retrieved successfully", teams));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get teams: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Team>> getTeamById(@PathVariable Long id) {
        try {
            Team team = teamService.getTeamById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));
            return ResponseEntity.ok(ApiResponse.success("Team retrieved successfully", team));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get team: " + e.getMessage()));
        }
    }

    @PostMapping("/{teamId}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<ApiResponse<Team>> addMemberToTeam(
            @PathVariable Long teamId,
            @PathVariable Long userId) {
        try {
            Team team = teamService.addMemberToTeam(teamId, userId);
            return ResponseEntity.ok(ApiResponse.success("Member added to team successfully", team));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to add member: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<ApiResponse<Team>> removeMemberFromTeam(
            @PathVariable Long teamId,
            @PathVariable Long userId) {
        try {
            Team team = teamService.removeMemberFromTeam(teamId, userId);
            return ResponseEntity.ok(ApiResponse.success("Member removed from team successfully", team));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
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
}