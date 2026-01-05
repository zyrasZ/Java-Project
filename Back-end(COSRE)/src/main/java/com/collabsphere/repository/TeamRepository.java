package com.collabsphere.repository;

import com.collabsphere.entity.Project;
import com.collabsphere.entity.Team;
import com.collabsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    
    List<Team> findByProject(Project project);
    
    List<Team> findByProjectId(Long projectId);
    
    @Query("SELECT t FROM Team t JOIN t.members m WHERE m.id = :userId")
    List<Team> findByMemberId(@Param("userId") Long userId);
    
    @Query("SELECT t FROM Team t WHERE t.name LIKE %:name%")
    List<Team> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT COUNT(t) FROM Team t WHERE t.project.id = :projectId")
    Long countByProjectId(@Param("projectId") Long projectId);
    
    boolean existsByProjectIdAndName(Long projectId, String name);
}