package com.collabsphere.repository;

import com.collabsphere.entity.Milestone;
import com.collabsphere.entity.Submission;
import com.collabsphere.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    
    List<Submission> findByMilestone(Milestone milestone);
    
    List<Submission> findByTeam(Team team);
    
    List<Submission> findByMilestoneId(Long milestoneId);
    
    List<Submission> findByTeamId(Long teamId);
    
    Optional<Submission> findByMilestoneIdAndTeamId(Long milestoneId, Long teamId);
    
    @Query("SELECT s FROM Submission s WHERE s.milestone.project.id = :projectId")
    List<Submission> findByProjectId(@Param("projectId") Long projectId);
    
    @Query("SELECT s FROM Submission s WHERE s.milestone.project.classRoom.id = :classroomId")
    List<Submission> findByClassroomId(@Param("classroomId") Long classroomId);
    
    @Query("SELECT s FROM Submission s WHERE s.grade IS NOT NULL")
    List<Submission> findGradedSubmissions();
    
    @Query("SELECT s FROM Submission s WHERE s.grade IS NULL")
    List<Submission> findUngradedSubmissions();
    
    @Query("SELECT s FROM Submission s WHERE s.milestone.id = :milestoneId AND s.grade IS NULL")
    List<Submission> findUngradedSubmissionsByMilestone(@Param("milestoneId") Long milestoneId);
    
    boolean existsByMilestoneIdAndTeamId(Long milestoneId, Long teamId);
}