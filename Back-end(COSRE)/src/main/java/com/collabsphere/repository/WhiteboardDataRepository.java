package com.collabsphere.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.collabsphere.entity.WhiteboardData;

@Repository
public interface WhiteboardDataRepository extends JpaRepository<WhiteboardData, Long> {
    Optional<WhiteboardData> findByTeamId(Long teamId);
}