package com.collabsphere.controller;

import com.collabsphere.dto.ApiResponse;
import com.collabsphere.entity.Rubric;
import com.collabsphere.entity.RubricCriteria;
import com.collabsphere.entity.RubricScore;
import com.collabsphere.entity.User;
import com.collabsphere.repository.UserRepository;
import com.collabsphere.security.UserPrincipal;
import com.collabsphere.service.RubricService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rubrics")
public class RubricController {

    @Autowired
    private RubricService rubricService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('LECTURER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Rubric>> createRubric(
            @Valid @RequestBody CreateRubricRequest request,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Rubric rubric = rubricService.createRubric(request, user);
            return ResponseEntity.ok(ApiResponse.success("Rubric created successfully", rubric));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to create rubric: " + e.getMessage()));
        }
    }

    @PostMapping("/{rubricId}/criteria")
    @PreAuthorize("hasRole('LECTURER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RubricCriteria>> addCriteria(
            @PathVariable Long rubricId,
            @Valid @RequestBody CreateCriteriaRequest request,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            RubricCriteria criteria = rubricService.addCriteria(rubricId, request, user);
            return ResponseEntity.ok(ApiResponse.success("Criteria added successfully", criteria));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to add criteria: " + e.getMessage()));
        }
    }

    @PostMapping("/grades/rubric")
    @PreAuthorize("hasRole('LECTURER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> gradeWithRubric(
            @Valid @RequestBody RubricGradeRequest request,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User grader = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> result = rubricService.gradeTeamWithRubric(request, grader);
            return ResponseEntity.ok(ApiResponse.success("Team graded successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to grade team: " + e.getMessage()));
        }
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<Rubric>>> getRubricsByProject(@PathVariable Long projectId) {
        try {
            List<Rubric> rubrics = rubricService.getRubricsByProject(projectId);
            return ResponseEntity.ok(ApiResponse.success("Rubrics retrieved successfully", rubrics));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get rubrics: " + e.getMessage()));
        }
    }

    @GetMapping("/{rubricId}/criteria")
    public ResponseEntity<ApiResponse<List<RubricCriteria>>> getCriteriaByRubric(@PathVariable Long rubricId) {
        try {
            List<RubricCriteria> criteria = rubricService.getCriteriaByRubric(rubricId);
            return ResponseEntity.ok(ApiResponse.success("Criteria retrieved successfully", criteria));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get criteria: " + e.getMessage()));
        }
    }

    @GetMapping("/team/{teamId}/scores")
    public ResponseEntity<ApiResponse<List<com.collabsphere.dto.RubricScoreDTO>>> getTeamScores(@PathVariable Long teamId) {
        try {
            List<com.collabsphere.dto.RubricScoreDTO> scores = rubricService.getTeamScores(teamId);
            return ResponseEntity.ok(ApiResponse.success("Team scores retrieved successfully", scores));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get team scores: " + e.getMessage()));
        }
    }

    @GetMapping("/team/{teamId}/rubric/{rubricId}/total")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTeamTotalScore(
            @PathVariable Long teamId,
            @PathVariable Long rubricId) {
        try {
            Map<String, Object> result = rubricService.calculateTeamTotalScore(teamId, rubricId);
            return ResponseEntity.ok(ApiResponse.success("Total score calculated", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to calculate total score: " + e.getMessage()));
        }
    }

    // DTOs
    public static class CreateRubricRequest {
        private Long projectId;
        private String name;
        private String description;

        // Getters and Setters
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class CreateCriteriaRequest {
        private String name;
        private String description;
        private Double weight;
        private Double maxScore;

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Double getWeight() { return weight; }
        public void setWeight(Double weight) { this.weight = weight; }
        public Double getMaxScore() { return maxScore; }
        public void setMaxScore(Double maxScore) { this.maxScore = maxScore; }
    }

    public static class RubricGradeRequest {
        private Long teamId;
        private Long rubricId;
        private List<CriteriaScore> scores;

        // Getters and Setters
        public Long getTeamId() { return teamId; }
        public void setTeamId(Long teamId) { this.teamId = teamId; }
        public Long getRubricId() { return rubricId; }
        public void setRubricId(Long rubricId) { this.rubricId = rubricId; }
        public List<CriteriaScore> getScores() { return scores; }
        public void setScores(List<CriteriaScore> scores) { this.scores = scores; }

        public static class CriteriaScore {
            private Long criteriaId;
            private Double score;
            private String feedback;

            // Getters and Setters
            public Long getCriteriaId() { return criteriaId; }
            public void setCriteriaId(Long criteriaId) { this.criteriaId = criteriaId; }
            public Double getScore() { return score; }
            public void setScore(Double score) { this.score = score; }
            public String getFeedback() { return feedback; }
            public void setFeedback(String feedback) { this.feedback = feedback; }
        }
    }
}