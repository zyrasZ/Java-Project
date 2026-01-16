package com.collabsphere.service;

import com.collabsphere.dto.ChatMessageRequest;
import com.collabsphere.dto.ChatMessageResponse;
import com.collabsphere.entity.Message;
import com.collabsphere.entity.Team;
import com.collabsphere.entity.User;
import com.collabsphere.entity.enums.UserRole;
import com.collabsphere.repository.MessageRepository;
import com.collabsphere.repository.TeamRepository;
import com.collabsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private UserRepository userRepository;

    public ChatMessageResponse sendMessage(ChatMessageRequest request) {
        // Find team
        Team team = teamRepository.findById(request.getTeamId())
            .orElseThrow(() -> new RuntimeException("Team not found"));

        // Find sender
        User sender = userRepository.findById(request.getSenderId())
            .orElseThrow(() -> new RuntimeException("Sender not found"));

        // Check if sender is a member of the team or has permission
        if (!isTeamMemberOrHasPermission(sender, team)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You are not a member of this team");
        }

        // Create and save message
        Message message = new Message();
        message.setContent(request.getContent());
        message.setTeam(team);
        message.setSender(sender);
        message.setTimestamp(LocalDateTime.now());

        Message savedMessage = messageRepository.save(message);

        // Convert to response DTO
        return convertToResponse(savedMessage);
    }

    public List<ChatMessageResponse> getTeamMessages(Long teamId, User user) {
        // Find team
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));

        // Check if user is a member of the team or has permission
        if (!isTeamMemberOrHasPermission(user, team)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You are not a member of this team");
        }

        List<Message> messages = messageRepository.findByTeamIdOrderByTimestamp(teamId);
        return messages.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ChatMessageResponse> getRecentMessages(Long teamId, User user, LocalDateTime since) {
        // Find team
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));

        // Check if user is a member of the team or has permission
        if (!isTeamMemberOrHasPermission(user, team)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "You are not a member of this team");
        }

        List<Message> messages = messageRepository.findByTeamIdAndTimestampAfter(teamId, since);
        return messages.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private ChatMessageResponse convertToResponse(Message message) {
        return new ChatMessageResponse(
            message.getId(),
            message.getContent(),
            message.getTeam().getId(),
            message.getTeam().getName(),
            message.getSender().getId(),
            message.getSender().getFullName(),
            message.getTimestamp()
        );
    }

    private boolean isTeamMemberOrHasPermission(User user, Team team) {
        // Admins and lecturers have access to all teams
        if (user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.LECTURER) {
            return true;
        }
        
        // Check if user is a member of the team
        return team.getMembers().contains(user);
    }
}