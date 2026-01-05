package com.collabsphere.repository;

import com.collabsphere.entity.Message;
import com.collabsphere.entity.Team;
import com.collabsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findByTeam(Team team);
    
    List<Message> findByTeamId(Long teamId);
    
    List<Message> findBySender(User sender);
    
    @Query("SELECT m FROM Message m WHERE m.team.id = :teamId ORDER BY m.timestamp ASC")
    List<Message> findByTeamIdOrderByTimestamp(@Param("teamId") Long teamId);
    
    @Query("SELECT m FROM Message m WHERE m.team.id = :teamId AND m.timestamp >= :since ORDER BY m.timestamp ASC")
    List<Message> findByTeamIdAndTimestampAfter(@Param("teamId") Long teamId, @Param("since") LocalDateTime since);
    
    @Query("SELECT m FROM Message m WHERE m.sender.id = :senderId ORDER BY m.timestamp DESC")
    List<Message> findBySenderIdOrderByTimestampDesc(@Param("senderId") Long senderId);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.team.id = :teamId")
    Long countByTeamId(@Param("teamId") Long teamId);
    
    @Query("SELECT m FROM Message m WHERE m.team.id = :teamId ORDER BY m.timestamp DESC")
    List<Message> findRecentMessagesByTeam(@Param("teamId") Long teamId);
}