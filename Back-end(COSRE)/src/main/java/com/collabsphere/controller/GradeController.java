package com.collabsphere.controller;

import com.collabsphere.dto.ApiResponse;
import com.collabsphere.dto.CreateSubmissionRequest;
import com.collabsphere.dto.GradeSubmissionRequest;
import com.collabsphere.entity.Submission;
import com.collabsphere.entity.User;
import com.collabsphere.repository.UserRepository;
import com.collabsphere.security.UserPrincipal;
import com.collabsphere.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/submissions")
public class GradeController {

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<Submission>> createSubmission(
            @Valid @RequestBody CreateSubmissionRequest request,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Submission submission = submissionService.createSubmission(request, user);
            return ResponseEntity.ok(ApiResponse.success("Submission created successfully", submission));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to create submission: " + e.getMessage()));
        }
    }

    @PostMapping("/grade")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<ApiResponse<Submission>> gradeSubmission(
            @Valid @RequestBody GradeSubmissionRequest request,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User lecturer = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Submission submission = submissionService.gradeSubmission(request, lecturer);
            return ResponseEntity.ok(ApiResponse.success("Submission graded successfully", submission));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to grade submission: " + e.getMessage()));
        }
    }

    @GetMapping("/milestone/{milestoneId}")
    public ResponseEntity<ApiResponse<List<Submission>>> getSubmissionsByMilestone(
            @PathVariable Long milestoneId,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<Submission> submissions = submissionService.getSubmissionsByMilestone(milestoneId, user);
            return ResponseEntity.ok(ApiResponse.success("Submissions retrieved successfully", submissions));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get submissions: " + e.getMessage()));
        }
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<ApiResponse<List<Submission>>> getSubmissionsByTeam(
            @PathVariable Long teamId,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<Submission> submissions = submissionService.getSubmissionsByTeam(teamId, user);
            return ResponseEntity.ok(ApiResponse.success("Team submissions retrieved successfully", submissions));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get team submissions: " + e.getMessage()));
        }
    }

    @GetMapping("/milestone/{milestoneId}/team/{teamId}")
    public ResponseEntity<ApiResponse<Submission>> getSubmissionByMilestoneAndTeam(
            @PathVariable Long milestoneId,
            @PathVariable Long teamId,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            Optional<Submission> submission = submissionService.getSubmissionByMilestoneAndTeam(milestoneId, teamId, user);
            if (submission.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("Submission retrieved successfully", submission.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get submission: " + e.getMessage()));
        }
    }

    @GetMapping("/ungraded")
    @PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
    public ResponseEntity<ApiResponse<List<Submission>>> getUngradedSubmissions(
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User lecturer = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<Submission> submissions = submissionService.getUngradedSubmissions(lecturer);
            return ResponseEntity.ok(ApiResponse.success("Ungraded submissions retrieved successfully", submissions));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get ungraded submissions: " + e.getMessage()));
        }
    }
}