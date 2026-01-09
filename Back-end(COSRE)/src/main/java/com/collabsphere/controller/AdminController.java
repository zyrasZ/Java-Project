package com.collabsphere.controller;

import com.collabsphere.dto.AddStudentRequest;
import com.collabsphere.dto.ApiResponse;
import com.collabsphere.dto.CreateClassRequest;
import com.collabsphere.entity.ClassRoom;
import com.collabsphere.entity.User;
import com.collabsphere.entity.enums.UserRole;
import com.collabsphere.repository.UserRepository;
import com.collabsphere.security.UserPrincipal;
import com.collabsphere.service.ClassRoomService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")  // Đã đúng rồi, không có /api
@PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
public class AdminController {

    @Autowired
    private ClassRoomService classRoomService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/classes/test")
    public ResponseEntity<ApiResponse<String>> testClassesEndpoint() {
        try {
            return ResponseEntity.ok(ApiResponse.success("Classes endpoint is working", "Test successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Test failed: " + e.getMessage()));
        }
    }

    @PostMapping("/classes")
    public ResponseEntity<ApiResponse<ClassRoom>> createClass(
            @Valid @RequestBody CreateClassRequest request,
            Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User lecturer = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            ClassRoom classRoom = classRoomService.createClassRoom(request, lecturer);
            return ResponseEntity.ok(ApiResponse.success("Classroom created successfully", classRoom));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to create classroom: " + e.getMessage()));
        }
    }

    @PostMapping("/classes/{id}/students")
    public ResponseEntity<ApiResponse<ClassRoom>> addStudentToClass(
            @PathVariable Long id,
            @Valid @RequestBody AddStudentRequest request) {
        try {
            ClassRoom classRoom = classRoomService.addStudentToClass(id, request);
            return ResponseEntity.ok(ApiResponse.success("Student added to classroom successfully", classRoom));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to add student: " + e.getMessage()));
        }
    }

    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<List<ClassRoom>>> getMyClasses(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<ClassRoom> classRooms;
            
            // Nếu là ADMIN thì lấy tất cả classes, nếu là LECTURER thì chỉ lấy classes của mình
            if (user.getRole() == UserRole.ADMIN) {
                classRooms = classRoomService.getAllClassRooms();
                System.out.println("🔍 Admin user - getting all classes: " + classRooms.size());
            } else {
                classRooms = classRoomService.getClassRoomsByLecturer(user);
                System.out.println("🔍 Lecturer user - getting own classes: " + classRooms.size());
            }
            
            return ResponseEntity.ok(ApiResponse.success("Classes retrieved successfully", classRooms));
        } catch (Exception e) {
            System.err.println("❌ Error in getMyClasses: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get classes: " + e.getMessage()));
        }
    }

    @GetMapping("/classes/{id}")
    public ResponseEntity<ApiResponse<ClassRoom>> getClassById(@PathVariable Long id) {
        try {
            ClassRoom classRoom = classRoomService.getClassRoomById(id)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
            return ResponseEntity.ok(ApiResponse.success("Classroom retrieved successfully", classRoom));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get classroom: " + e.getMessage()));
        }
    }

    @DeleteMapping("/classes/{id}/students")
    public ResponseEntity<ApiResponse<ClassRoom>> removeStudentFromClass(
            @PathVariable Long id,
            @RequestParam String email) {
        try {
            ClassRoom classRoom = classRoomService.removeStudentFromClass(id, email);
            return ResponseEntity.ok(ApiResponse.success("Student removed from classroom successfully", classRoom));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to remove student: " + e.getMessage()));
        }
    }

    @GetMapping("/classes/code/{code}")
    public ResponseEntity<ApiResponse<ClassRoom>> getClassByCode(@PathVariable String code) {
        try {
            ClassRoom classRoom = classRoomService.getClassRoomByCode(code)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
            return ResponseEntity.ok(ApiResponse.success("Classroom retrieved successfully", classRoom));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get classroom: " + e.getMessage()));
        }
    }
}