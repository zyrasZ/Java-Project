package com.collabsphere.controller;

import com.collabsphere.dto.ApiResponse;
import com.collabsphere.dto.ChatMessageRequest;
import com.collabsphere.dto.ChatMessageResponse;
import com.collabsphere.entity.User;
import com.collabsphere.repository.UserRepository;
import com.collabsphere.security.UserPrincipal;
import com.collabsphere.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserRepository userRepository;

    // WebSocket endpoint for real-time chat
    @MessageMapping("/chat/{teamId}")
    @SendTo("/topic/team/{teamId}")
    public ChatMessageResponse sendMessage(@DestinationVariable Long teamId, ChatMessageRequest message) {
        try {
            // Set team ID from path variable
            message.setTeamId(teamId);
            
            // Save message to database and return response
            return chatService.sendMessage(message);
        } catch (Exception e) {
            // Handle error - in real implementation, you might want to send error to specific user
            throw new RuntimeException("Failed to send message: " + e.getMessage());
        }
    }

    // REST endpoint to get chat history
    @GetMapping("/api/teams/{teamId}/messages")
    @ResponseBody
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getTeamMessages(
            @PathVariable Long teamId,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<ChatMessageResponse> messages = chatService.getTeamMessages(teamId, user);
            return ResponseEntity.ok(ApiResponse.success("Messages retrieved successfully", messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get messages: " + e.getMessage()));
        }
    }

    // REST endpoint to get recent messages since a timestamp
    @GetMapping("/api/teams/{teamId}/messages/since")
    @ResponseBody
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getRecentMessages(
            @PathVariable Long teamId,
            @RequestParam String since,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            LocalDateTime sinceDateTime = LocalDateTime.parse(since);
            List<ChatMessageResponse> messages = chatService.getRecentMessages(teamId, user, sinceDateTime);
            return ResponseEntity.ok(ApiResponse.success("Recent messages retrieved successfully", messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get recent messages: " + e.getMessage()));
        }
    }
}