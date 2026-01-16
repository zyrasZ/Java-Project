package com.collabsphere.service;

import com.collabsphere.controller.RubricController;
import com.collabsphere.entity.*;
import com.collabsphere.entity.enums.UserRole;
import com.collabsphere.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class RubricService {

    @Autowired
    private RubricRepository rubricRepository;
    
    @Autowired
    private RubricCriteriaRepository rubricCriteriaRepository;
    
    @Autowired
    private RubricScoreRepository rubricScoreRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private TeamRepository teamRepository;

    public Rubric createRubric(RubricController.CreateRubricRequest request, User user) {
        // Validate user role
        if (user.getRole() != UserRole.LECTURER && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Only lecturers and admins can create rubrics");
        }

        // Find project
        Project project = projectRepository.findById(request.getProjectId())
            .orElseThrow(() -> new RuntimeException("Project not found"));

        // Validate lecturer owns the project (unless admin)
        if (user.getRole() == UserRole.LECTURER && 
            !project.getClassRoom().getLecturer().getId().equals(user.getId())) {
            throw new RuntimeException("You can only create rubrics for your own projects");
        }

        Rubric rubric = new Rubric(project, request.getName(), request.getDescription());
        return rubricRepository.save(rubric);
    }

    public RubricCriteria addCriteria(Long rubricId, RubricController.CreateCriteriaRequest request, User user) {
        // Find rubric
        Rubric rubric = rubricRepository.findById(rubricId)
            .orElseThrow(() -> new RuntimeException("Rubric not found"));

        // Validate user can modify this rubric
        if (user.getRole() == UserRole.LECTURER && 
            !rubric.getProject().getClassRoom().getLecturer().getId().equals(user.getId())) {
            throw new RuntimeException("You can only modify your own rubrics");
        }

        // Validate weight (should be between 0 and 1)
        if (request.getWeight() < 0 || request.getWeight() > 1) {
            throw new RuntimeException("Weight must be between 0 and 1");
        }

        RubricCriteria criteria = new RubricCriteria(
            rubric, 
            request.getName(), 
            request.getDescription(), 
            request.getWeight(), 
            request.getMaxScore()
        );
        
        return rubricCriteriaRepository.save(criteria);
    }

    public Map<String, Object> gradeTeamWithRubric(RubricController.RubricGradeRequest request, User grader) {
        // Find team and rubric
        Team team = teamRepository.findById(request.getTeamId())
            .orElseThrow(() -> new RuntimeException("Team not found"));
        
        Rubric rubric = rubricRepository.findById(request.getRubricId())
            .orElseThrow(() -> new RuntimeException("Rubric not found"));

        // Validate grader can grade this team
        if (grader.getRole() == UserRole.LECTURER && 
            !team.getProject().getClassRoom().getLecturer().getId().equals(grader.getId())) {
            throw new RuntimeException("You can only grade teams in your own projects");
        }

        double totalScore = 0.0;
        double totalWeight = 0.0;

        // Process each criteria score
        for (RubricController.RubricGradeRequest.CriteriaScore criteriaScore : request.getScores()) {
            RubricCriteria criteria = rubricCriteriaRepository.findById(criteriaScore.getCriteriaId())
                .orElseThrow(() -> new RuntimeException("Criteria not found"));

            // Validate criteria belongs to the rubric
            if (!criteria.getRubric().getId().equals(request.getRubricId())) {
                throw new RuntimeException("Criteria does not belong to the specified rubric");
            }

            // Validate score is within range
            if (criteriaScore.getScore() < 0 || criteriaScore.getScore() > criteria.getMaxScore()) {
                throw new RuntimeException("Score must be between 0 and " + criteria.getMaxScore());
            }

            // Save or update score
            RubricScore score = rubricScoreRepository.findByTeamIdAndCriteriaId(
                request.getTeamId(), criteriaScore.getCriteriaId())
                .orElse(new RubricScore());

            score.setTeam(team);
            score.setCriteria(criteria);
            score.setScore(criteriaScore.getScore());
            score.setFeedback(criteriaScore.getFeedback());
            score.setGradedBy(grader);
            
            rubricScoreRepository.save(score);

            // Calculate weighted score
            double normalizedScore = criteriaScore.getScore() / criteria.getMaxScore(); // 0-1
            totalScore += normalizedScore * criteria.getWeight();
            totalWeight += criteria.getWeight();
        }

        // Calculate final score (0-10 scale)
        double finalScore = totalWeight > 0 ? (totalScore / totalWeight) * 10 : 0;

        // Prepare result
        Map<String, Object> result = new HashMap<>();
        result.put("teamId", request.getTeamId());
        result.put("rubricId", request.getRubricId());
        result.put("totalScore", Math.round(finalScore * 100.0) / 100.0); // Round to 2 decimal places
        result.put("totalWeight", totalWeight);
        result.put("gradedBy", grader.getFullName());
        result.put("gradedAt", java.time.LocalDateTime.now());

        return result;
    }

    public List<Rubric> getRubricsByProject(Long projectId) {
        return rubricRepository.findByProjectId(projectId);
    }

    public List<RubricCriteria> getCriteriaByRubric(Long rubricId) {
        return rubricCriteriaRepository.findByRubricId(rubricId);
    }

    public List<RubricScore> getTeamScores(Long teamId) {
        return rubricScoreRepository.findByTeamId(teamId);
    }

    public Map<String, Object> calculateTeamTotalScore(Long teamId, Long rubricId) {
        List<RubricScore> scores = rubricScoreRepository.findByTeamIdAndRubricId(teamId, rubricId);
        
        if (scores.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("totalScore", 0.0);
            result.put("message", "No scores found for this team and rubric");
            return result;
        }

        double totalScore = 0.0;
        double totalWeight = 0.0;
        int criteriaCount = 0;

        for (RubricScore score : scores) {
            RubricCriteria criteria = score.getCriteria();
            double normalizedScore = score.getScore() / criteria.getMaxScore(); // 0-1
            totalScore += normalizedScore * criteria.getWeight();
            totalWeight += criteria.getWeight();
            criteriaCount++;
        }

        double finalScore = totalWeight > 0 ? (totalScore / totalWeight) * 10 : 0;

        Map<String, Object> result = new HashMap<>();
        result.put("teamId", teamId);
        result.put("rubricId", rubricId);
        result.put("totalScore", Math.round(finalScore * 100.0) / 100.0);
        result.put("totalWeight", totalWeight);
        result.put("criteriaCount", criteriaCount);
        result.put("calculatedAt", java.time.LocalDateTime.now());

        return result;
    }
}