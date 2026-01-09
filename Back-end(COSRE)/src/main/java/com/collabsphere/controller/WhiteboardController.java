package com.collabsphere.controller;

import com.collabsphere.dto.ApiResponse;
import com.collabsphere.entity.WhiteboardData;
import com.collabsphere.service.WhiteboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class WhiteboardController {

    @Autowired
    private WhiteboardService whiteboardService;

    @GetMapping("/api/whiteboards/{teamId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('LECTURER') or hasRole('ADMIN')")
    @ResponseBody
    public ResponseEntity<ApiResponse<WhiteboardData>> getWhiteboardData(@PathVariable Long teamId) {
        try {
            WhiteboardData data = whiteboardService.getWhiteboardData(teamId);
            return ResponseEntity.ok(ApiResponse.success("Whiteboard data retrieved", data));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get whiteboard data: " + e.getMessage()));
        }
    }

    @PostMapping("/api/whiteboards/{teamId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('LECTURER') or hasRole('ADMIN')")
    @ResponseBody
    public ResponseEntity<ApiResponse<WhiteboardData>> saveWhiteboardData(
            @PathVariable Long teamId,
            @RequestBody String dataJson) {
        try {
            WhiteboardData data = whiteboardService.saveWhiteboardData(teamId, dataJson);
            return ResponseEntity.ok(ApiResponse.success("Whiteboard data saved", data));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to save whiteboard data: " + e.getMessage()));
        }
    }

    // WebSocket endpoints for real-time whiteboard collaboration
    @MessageMapping("/whiteboard/{teamId}")
    @SendTo("/topic/whiteboard/{teamId}")
    public WhiteboardDrawEvent handleWhiteboardDraw(
            @DestinationVariable Long teamId,
            WhiteboardDrawEvent drawEvent) {
        try {
            // Validate team membership here if needed
            drawEvent.setTimestamp(System.currentTimeMillis());
            return drawEvent;
        } catch (Exception e) {
            // Log error
            return null;
        }
    }

    // DTO for whiteboard draw events
    public static class WhiteboardDrawEvent {
        private String type; // "draw", "erase", "clear"
        private Double x;
        private Double y;
        private Double prevX;
        private Double prevY;
        private String color;
        private Integer lineWidth;
        private String userId;
        private Long timestamp;

        // Constructors
        public WhiteboardDrawEvent() {}

        // Getters and Setters
        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Double getX() {
            return x;
        }

        public void setX(Double x) {
            this.x = x;
        }

        public Double getY() {
            return y;
        }

        public void setY(Double y) {
            this.y = y;
        }

        public Double getPrevX() {
            return prevX;
        }

        public void setPrevX(Double prevX) {
            this.prevX = prevX;
        }

        public Double getPrevY() {
            return prevY;
        }

        public void setPrevY(Double prevY) {
            this.prevY = prevY;
        }

        public String getColor() {
            return color;
        }

        public void setColor(String color) {
            this.color = color;
        }

        public Integer getLineWidth() {
            return lineWidth;
        }

        public void setLineWidth(Integer lineWidth) {
            this.lineWidth = lineWidth;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public Long getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(Long timestamp) {
            this.timestamp = timestamp;
        }
    }
}