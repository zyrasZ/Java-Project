package com.collabsphere.repository;

import com.collabsphere.entity.WhiteboardData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WhiteboardDataRepository extends JpaRepository<WhiteboardData, Long> {
    Optional<WhiteboardData> findByTeamId(Long teamId);
}