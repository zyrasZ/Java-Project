package com.collabsphere.repository;

import com.collabsphere.entity.RubricScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RubricScoreRepository extends JpaRepository<RubricScore, Long> {
    List<RubricScore> findByTeamId(Long teamId);
    List<RubricScore> findByCriteriaId(Long criteriaId);
    Optional<RubricScore> findByTeamIdAndCriteriaId(Long teamId, Long criteriaId);
    
    @Query("SELECT rs FROM RubricScore rs WHERE rs.team.id = :teamId AND rs.criteria.rubric.id = :rubricId")
    List<RubricScore> findByTeamIdAndRubricId(@Param("teamId") Long teamId, @Param("rubricId") Long rubricId);
}