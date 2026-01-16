package com.collabsphere.service;

import com.collabsphere.dto.CreateSubmissionRequest;
import com.collabsphere.dto.GradeSubmissionRequest;
import com.collabsphere.entity.Milestone;
import com.collabsphere.entity.Submission;
import com.collabsphere.entity.Team;
import com.collabsphere.entity.User;
import com.collabsphere.entity.enums.UserRole;
import com.collabsphere.repository.MilestoneRepository;
import com.collabsphere.repository.SubmissionRepository;
import com.collabsphere.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private MilestoneRepository milestoneRepository;

    @Autowired
    private TeamRepository teamRepository;

    public Submission createSubmission(CreateSubmissionRequest request, User user) {
        // Find milestone
        Milestone milestone = milestoneRepository.findById(request.getMilestoneId())
            .orElseThrow(() -> new RuntimeException("Milestone not found"));

        // Find team
        Team team = teamRepository.findById(request.getTeamId())
            .orElseThrow(() -> new RuntimeException("Team not found"));

        // Check if user is a member of the team
        if (!isTeamMemberOrHasPermission(user, team)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You are not a member of this team");
        }

        // Check if submission already exists for this milestone and team
        if (submissionRepository.existsByMilestoneIdAndTeamId(request.getMilestoneId(), request.getTeamId())) {
            throw new RuntimeException("Submission already exists for this milestone and team");
        }

        // Check if milestone belongs to the same project as the team
        if (!milestone.getProject().getId().equals(team.getProject().getId())) {
            throw new RuntimeException("Milestone does not belong to the same project as the team");
        }

        // Create submission
        Submission submission = new Submission();
        submission.setLink(request.getLink());
        submission.setMilestone(milestone);
        submission.setTeam(team);
        submission.setSubmittedAt(LocalDateTime.now());

        return submissionRepository.save(submission);
    }

    public Submission gradeSubmission(GradeSubmissionRequest request, User lecturer) {
        // Check if user is lecturer or admin
        if (lecturer.getRole() != UserRole.LECTURER && lecturer.getRole() != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "Only lecturers and admins can grade submissions");
        }

        // Find submission
        Submission submission = submissionRepository.findById(request.getSubmissionId())
            .orElseThrow(() -> new RuntimeException("Submission not found"));

        // Check if lecturer owns the classroom (unless admin)
        if (lecturer.getRole() == UserRole.LECTURER) {
            Long lecturerId = submission.getMilestone().getProject().getClassRoom().getLecturer().getId();
            if (!lecturerId.equals(lecturer.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "You can only grade submissions for your own classes");
            }
        }

        // Update grade
        submission.setGrade(request.getGrade());
        submission.setFeedback(request.getFeedback());
        submission.setGradedAt(LocalDateTime.now());

        return submissionRepository.save(submission);
    }

    public List<Submission> getSubmissionsByMilestone(Long milestoneId, User user) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
            .orElseThrow(() -> new RuntimeException("Milestone not found"));

        // Check permissions
        if (user.getRole() == UserRole.STUDENT) {
            // Students can only see submissions from their own teams
            List<Team> userTeams = teamRepository.findByMemberId(user.getId());
            return submissionRepository.findByMilestoneId(milestoneId).stream()
                .filter(submission -> userTeams.contains(submission.getTeam()))
                .toList();
        } else {
            // Lecturers and admins can see all submissions
            return submissionRepository.findByMilestoneId(milestoneId);
        }
    }

    public List<Submission> getSubmissionsByTeam(Long teamId, User user) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));

        // Check if user has permission to view team submissions
        if (!isTeamMemberOrHasPermission(user, team)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You are not authorized to view this team's submissions");
        }

        return submissionRepository.findByTeamId(teamId);
    }

    public Optional<Submission> getSubmissionByMilestoneAndTeam(Long milestoneId, Long teamId, User user) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));

        // Check permissions
        if (!isTeamMemberOrHasPermission(user, team)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You are not authorized to view this submission");
        }

        return submissionRepository.findByMilestoneIdAndTeamId(milestoneId, teamId);
    }

    public List<Submission> getUngradedSubmissions(User lecturer) {
        if (lecturer.getRole() != UserRole.LECTURER && lecturer.getRole() != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "Only lecturers and admins can view ungraded submissions");
        }

        if (lecturer.getRole() == UserRole.ADMIN) {
            return submissionRepository.findUngradedSubmissions();
        } else {
            // Filter by lecturer's classrooms
            return submissionRepository.findUngradedSubmissions().stream()
                .filter(submission -> {
                    Long lecturerId = submission.getMilestone().getProject().getClassRoom().getLecturer().getId();
                    return lecturerId.equals(lecturer.getId());
                })
                .toList();
        }
    }

    private boolean isTeamMemberOrHasPermission(User user, Team team) {
        // Admins and lecturers have access to all teams
        if (user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.LECTURER) {
            return true;
        }
        
        // Check if user is a member of the team
        return team.getMembers().contains(user);
    }
}