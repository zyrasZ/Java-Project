package com.collabsphere.service;

import com.collabsphere.entity.Team;
import com.collabsphere.entity.WhiteboardData;
import com.collabsphere.repository.TeamRepository;
import com.collabsphere.repository.WhiteboardDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class WhiteboardService {

    @Autowired
    private WhiteboardDataRepository whiteboardDataRepository;
    
    @Autowired
    private TeamRepository teamRepository;

    public WhiteboardData getWhiteboardData(Long teamId) {
        // Validate team exists
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));
        
        // Get existing whiteboard data or create empty one
        return whiteboardDataRepository.findByTeamId(teamId)
            .orElse(new WhiteboardData(team, "{}"));
    }

    public WhiteboardData saveWhiteboardData(Long teamId, String dataJson) {
        // Validate team exists
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));
        
        // Get existing whiteboard data or create new one
        WhiteboardData whiteboardData = whiteboardDataRepository.findByTeamId(teamId)
            .orElse(new WhiteboardData());
        
        whiteboardData.setTeam(team);
        whiteboardData.setDataJson(dataJson);
        
        return whiteboardDataRepository.save(whiteboardData);
    }

    public void clearWhiteboardData(Long teamId) {
        whiteboardDataRepository.findByTeamId(teamId)
            .ifPresent(data -> {
                data.setDataJson("{}");
                whiteboardDataRepository.save(data);
            });
    }
}