package com.collabsphere.controller;

import com.collabsphere.dto.AddStudentRequest;
import com.collabsphere.dto.ApiResponse;
import com.collabsphere.dto.ClassRoomDTO;
import com.collabsphere.dto.CreateClassRequest;
import com.collabsphere.dto.CreateStaffRequest;
import com.collabsphere.entity.ClassRoom;
import com.collabsphere.entity.User;
import com.collabsphere.repository.UserRepository;
import com.collabsphere.security.UserPrincipal;
import com.collabsphere.service.ClassRoomService;
import com.collabsphere.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN') or hasRole('LECTURER')")
public class AdminController {

    @Autowired
    private ClassRoomService classRoomService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

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
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<ClassRoom>>> getMyClasses(Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User lecturer = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            List<ClassRoom> classRooms = classRoomService.getClassRoomsByLecturer(lecturer);
            return ResponseEntity.ok(ApiResponse.success("Classes retrieved successfully", classRooms));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get classes: " + e.getMessage()));
        }
    }

    @GetMapping("/classes/{id}/dto")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<ClassRoomDTO>> getClassByIdAsDTO(@PathVariable Long id) {
        try {
            System.out.println("=== DEBUG: AdminController.getClassByIdAsDTO START ===");
            System.out.println("ClassRoom ID: " + id);
            
            ClassRoomDTO classRoom = classRoomService.getClassRoomByIdAsDTO(id);
            if (classRoom == null) {
                return ResponseEntity.notFound().build();
            }
            
            System.out.println("ClassRoom DTO retrieved successfully: " + classRoom.getName());
            System.out.println("=== DEBUG: AdminController.getClassByIdAsDTO SUCCESS ===");
            
            return ResponseEntity.ok(ApiResponse.success("Classroom retrieved successfully", classRoom));
        } catch (Exception e) {
            System.out.println("=== DEBUG: AdminController.getClassByIdAsDTO ERROR ===");
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get classroom: " + e.getMessage()));
        }
    }

    @GetMapping("/classes/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<ClassRoom>> getClassById(@PathVariable Long id) {
        try {
            System.out.println("=== DEBUG: AdminController.getClassById START ===");
            System.out.println("ClassRoom ID: " + id);
            
            ClassRoom classRoom = classRoomService.getClassRoomById(id)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
            
            System.out.println("ClassRoom retrieved successfully: " + classRoom.getName());
            System.out.println("=== DEBUG: AdminController.getClassById SUCCESS ===");
            
            return ResponseEntity.ok(ApiResponse.success("Classroom retrieved successfully", classRoom));
        } catch (Exception e) {
            System.out.println("=== DEBUG: AdminController.getClassById ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
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
    @Transactional(readOnly = true)
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

    /**
     * Lấy tất cả lớp học trong hệ thống (chỉ ADMIN)
     * Trả về danh sách lớp học với thông tin lecturer
     */
    @GetMapping("/classes/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<ClassRoom>>> getAllClasses() {
        try {
            System.out.println("=== DEBUG: AdminController.getAllClasses START ===");
            
            List<ClassRoom> classRooms = classRoomService.getAllClassRooms();
            
            System.out.println("Retrieved " + classRooms.size() + " classrooms successfully");
            System.out.println("=== DEBUG: AdminController.getAllClasses SUCCESS ===");
            
            return ResponseEntity.ok(ApiResponse.success("All classrooms retrieved successfully", classRooms));
        } catch (Exception e) {
            System.out.println("=== DEBUG: AdminController.getAllClasses ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get all classrooms: " + e.getMessage()));
        }
    }

    /**
     * Lấy tất cả lớp học với thông tin chi tiết (lecturer + students) - chỉ ADMIN
     */
    @GetMapping("/classes/all/details")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<ClassRoom>>> getAllClassesWithDetails() {
        try {
            System.out.println("=== DEBUG: AdminController.getAllClassesWithDetails START ===");
            
            List<ClassRoom> classRooms = classRoomService.getAllClassRoomsWithDetails();
            
            System.out.println("Retrieved " + classRooms.size() + " classrooms with details successfully");
            System.out.println("=== DEBUG: AdminController.getAllClassesWithDetails SUCCESS ===");
            
            return ResponseEntity.ok(ApiResponse.success("All classrooms with details retrieved successfully", classRooms));
        } catch (Exception e) {
            System.out.println("=== DEBUG: AdminController.getAllClassesWithDetails ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get all classrooms with details: " + e.getMessage()));
        }
    }

    /**
     * Lấy tất cả lớp học dưới dạng DTO (debugging) - chỉ ADMIN
     */
    @GetMapping("/classes/all/dto")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<ClassRoomDTO>>> getAllClassesAsDTO() {
        try {
            System.out.println("=== DEBUG: AdminController.getAllClassesAsDTO START ===");
            
            List<ClassRoomDTO> classRooms = classRoomService.getAllClassRoomsAsDTO();
            
            System.out.println("Retrieved " + classRooms.size() + " classroom DTOs successfully");
            System.out.println("=== DEBUG: AdminController.getAllClassesAsDTO SUCCESS ===");
            
            return ResponseEntity.ok(ApiResponse.success("All classrooms retrieved successfully", classRooms));
        } catch (Exception e) {
            System.out.println("=== DEBUG: AdminController.getAllClassesAsDTO ERROR ===");
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to get all classrooms: " + e.getMessage()));
        }
    }

    /**
     * Tạo tài khoản STAFF mới
     * Chỉ ADMIN mới có quyền tạo tài khoản STAFF
     */
    @PostMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        try {
            User staff = userService.createStaffUser(request);
            return ResponseEntity.ok(ApiResponse.success("Tạo tài khoản STAFF thành công", staff));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Lỗi tạo tài khoản STAFF: " + e.getMessage()));
        }
    }
}