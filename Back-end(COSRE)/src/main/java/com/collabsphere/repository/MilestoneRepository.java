package com.collabsphere.repository;

import com.collabsphere.entity.Milestone;
import com.collabsphere.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    
    List<Milestone> findByProject(Project project);
    
    List<Milestone> findByProjectId(Long projectId);
    
    @Query("SELECT m FROM Milestone m WHERE m.project.id = :projectId ORDER BY m.dueDate ASC")
    List<Milestone> findByProjectIdOrderByDueDate(@Param("projectId") Long projectId);
    
    @Query("SELECT m FROM Milestone m WHERE m.dueDate BETWEEN :startDate AND :endDate")
    List<Milestone> findByDueDateBetween(@Param("startDate") LocalDateTime startDate, 
                                        @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT m FROM Milestone m WHERE m.project.id = :projectId AND m.dueDate > :currentDate")
    List<Milestone> findUpcomingMilestones(@Param("projectId") Long projectId, 
                                          @Param("currentDate") LocalDateTime currentDate);
}