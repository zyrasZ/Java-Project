package com.collabsphere.repository;

import com.collabsphere.entity.Task;
import com.collabsphere.entity.Team;
import com.collabsphere.entity.User;
import com.collabsphere.entity.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findByTeam(Team team);
    
    @Query("SELECT DISTINCT t FROM Task t " +
           "LEFT JOIN FETCH t.team tm " +
           "LEFT JOIN FETCH t.assignee a " +
           "LEFT JOIN FETCH tm.project p " +
           "LEFT JOIN FETCH p.classRoom c " +
           "WHERE t.team.id = :teamId")
    List<Task> findByTeamId(@Param("teamId") Long teamId);
    
    List<Task> findByAssignee(User assignee);
    
    // Simplified query for debugging
    @Query("SELECT t FROM Task t WHERE t.assignee.id = :assigneeId")
    List<Task> findByAssigneeIdSimple(@Param("assigneeId") Long assigneeId);
    
    @Query("SELECT DISTINCT t FROM Task t " +
           "LEFT JOIN FETCH t.team tm " +
           "LEFT JOIN FETCH t.assignee a " +
           "WHERE t.assignee IS NOT NULL AND t.assignee.id = :assigneeId")
    List<Task> findByAssigneeId(@Param("assigneeId") Long assigneeId);
    
    List<Task> findByStatus(TaskStatus status);
    
    @Query("SELECT DISTINCT t FROM Task t " +
           "LEFT JOIN FETCH t.team tm " +
           "LEFT JOIN FETCH t.assignee a " +
           "LEFT JOIN FETCH tm.project p " +
           "LEFT JOIN FETCH p.classRoom c " +
           "WHERE t.team.id = :teamId AND t.status = :status")
    List<Task> findByTeamIdAndStatus(@Param("teamId") Long teamId, @Param("status") TaskStatus status);
    
    @Query("SELECT DISTINCT t FROM Task t " +
           "LEFT JOIN FETCH t.team tm " +
           "LEFT JOIN FETCH t.assignee a " +
           "LEFT JOIN FETCH tm.project p " +
           "LEFT JOIN FETCH p.classRoom c " +
           "WHERE t.team.id = :teamId ORDER BY t.priority DESC, t.id ASC")
    List<Task> findByTeamIdOrderByPriorityDesc(@Param("teamId") Long teamId);
    
    @Query("SELECT DISTINCT t FROM Task t " +
           "LEFT JOIN FETCH t.team tm " +
           "LEFT JOIN FETCH t.assignee a " +
           "LEFT JOIN FETCH tm.project p " +
           "LEFT JOIN FETCH p.classRoom c " +
           "WHERE t.assignee.id = :assigneeId AND t.status = :status")
    List<Task> findByAssigneeIdAndStatus(@Param("assigneeId") Long assigneeId, @Param("status") TaskStatus status);
    
    @Query("SELECT t FROM Task t WHERE t.dueDate BETWEEN :startDate AND :endDate")
    List<Task> findByDueDateBetween(@Param("startDate") LocalDateTime startDate, 
                                   @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT DISTINCT t FROM Task t " +
           "LEFT JOIN FETCH t.team tm " +
           "LEFT JOIN FETCH t.assignee a " +
           "LEFT JOIN FETCH tm.project p " +
           "LEFT JOIN FETCH p.classRoom c " +
           "WHERE t.team.id = :teamId AND t.dueDate < :currentDate AND t.status != 'DONE'")
    List<Task> findOverdueTasksByTeam(@Param("teamId") Long teamId, @Param("currentDate") LocalDateTime currentDate);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.team.id = :teamId AND t.status = :status")
    Long countByTeamIdAndStatus(@Param("teamId") Long teamId, @Param("status") TaskStatus status);
    
    @Query("SELECT DISTINCT t FROM Task t " +
           "LEFT JOIN FETCH t.team tm " +
           "LEFT JOIN FETCH t.assignee a " +
           "LEFT JOIN FETCH tm.project p " +
           "LEFT JOIN FETCH p.classRoom c " +
           "JOIN tm.members m WHERE m.id = :userId")
    List<Task> findTasksByTeamMember(@Param("userId") Long userId);
}