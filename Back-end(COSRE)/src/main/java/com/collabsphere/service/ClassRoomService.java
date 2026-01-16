package com.collabsphere.service;

import com.collabsphere.dto.AddStudentRequest;
import com.collabsphere.dto.ClassRoomDTO;
import com.collabsphere.dto.CreateClassRequest;
import com.collabsphere.entity.ClassRoom;
import com.collabsphere.entity.User;
import com.collabsphere.entity.enums.UserRole;
import com.collabsphere.repository.ClassRoomRepository;
import com.collabsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ClassRoomService {

    @Autowired
    private ClassRoomRepository classRoomRepository;

    @Autowired
    private UserRepository userRepository;

    public ClassRoom createClassRoom(CreateClassRequest request, User lecturer) {
        // Validate lecturer role
        if (lecturer.getRole() != UserRole.LECTURER && lecturer.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Only lecturers and admins can create classrooms");
        }

        // Check if code already exists
        if (classRoomRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Classroom code already exists");
        }

        ClassRoom classRoom = new ClassRoom();
        classRoom.setName(request.getName());
        classRoom.setCode(request.getCode());
        classRoom.setLecturer(lecturer);

        return classRoomRepository.save(classRoom);
    }

    public ClassRoom addStudentToClass(Long classId, AddStudentRequest request) {
        // Find classroom
        ClassRoom classRoom = classRoomRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Classroom not found"));

        // Find user by email
        User student = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User with email " + request.getEmail() + " not found"));

        // Validate student role
        if (student.getRole() != UserRole.STUDENT) {
            throw new RuntimeException("Only students can be added to classrooms");
        }

        // Check if student is already in the class
        if (classRoom.getStudents().contains(student)) {
            throw new RuntimeException("Student is already in this classroom");
        }

        // Add student to classroom
        classRoom.getStudents().add(student);
        student.getClassRoomsAsStudent().add(classRoom);

        return classRoomRepository.save(classRoom);
    }

    @Transactional(readOnly = true)
    public List<ClassRoom> getClassRoomsByLecturer(User lecturer) {
        return classRoomRepository.findByLecturer(lecturer);
    }

    @Transactional(readOnly = true)
    public List<ClassRoom> getClassRoomsByStudent(Long studentId) {
        return classRoomRepository.findByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public Optional<ClassRoom> getClassRoomById(Long id) {
        System.out.println("=== DEBUG: ClassRoomService.getClassRoomById START ===");
        System.out.println("ClassRoom ID: " + id);
        
        try {
            Optional<ClassRoom> classRoom = classRoomRepository.findByIdWithDetails(id);
            
            if (classRoom.isPresent()) {
                System.out.println("ClassRoom found: " + classRoom.get().getName());
                System.out.println("ClassRoom code: " + classRoom.get().getCode());
                
                // Test accessing lazy properties to ensure they're loaded
                if (classRoom.get().getLecturer() != null) {
                    System.out.println("Lecturer: " + classRoom.get().getLecturer().getFullName());
                }
                System.out.println("Students count: " + classRoom.get().getStudents().size());
            } else {
                System.out.println("ClassRoom not found");
            }
            
            System.out.println("=== DEBUG: ClassRoomService.getClassRoomById SUCCESS ===");
            return classRoom;
        } catch (Exception e) {
            System.out.println("=== DEBUG: ClassRoomService.getClassRoomById ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public Optional<ClassRoom> getClassRoomByCode(String code) {
        return classRoomRepository.findByCode(code);
    }

    @Transactional(readOnly = true)
    public List<ClassRoom> getAllClassRooms() {
        System.out.println("=== DEBUG: ClassRoomService.getAllClassRooms START ===");
        
        try {
            List<ClassRoom> classRooms = classRoomRepository.findAllWithLecturer();
            System.out.println("Found " + classRooms.size() + " classrooms");
            
            // Test accessing lazy properties to ensure they're loaded
            for (ClassRoom classRoom : classRooms) {
                System.out.println("ClassRoom: " + classRoom.getName() + " (" + classRoom.getCode() + ")");
                if (classRoom.getLecturer() != null) {
                    System.out.println("  Lecturer: " + classRoom.getLecturer().getFullName());
                }
            }
            
            System.out.println("=== DEBUG: ClassRoomService.getAllClassRooms SUCCESS ===");
            return classRooms;
        } catch (Exception e) {
            System.out.println("=== DEBUG: ClassRoomService.getAllClassRooms ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<ClassRoom> getAllClassRoomsWithDetails() {
        System.out.println("=== DEBUG: ClassRoomService.getAllClassRoomsWithDetails START ===");
        
        try {
            List<ClassRoom> classRooms = classRoomRepository.findAllWithDetails();
            System.out.println("Found " + classRooms.size() + " classrooms with full details");
            
            // Test accessing lazy properties to ensure they're loaded
            for (ClassRoom classRoom : classRooms) {
                System.out.println("ClassRoom: " + classRoom.getName() + " (" + classRoom.getCode() + ")");
                if (classRoom.getLecturer() != null) {
                    System.out.println("  Lecturer: " + classRoom.getLecturer().getFullName());
                }
                System.out.println("  Students count: " + classRoom.getStudents().size());
            }
            
            System.out.println("=== DEBUG: ClassRoomService.getAllClassRoomsWithDetails SUCCESS ===");
            return classRooms;
        } catch (Exception e) {
            System.out.println("=== DEBUG: ClassRoomService.getAllClassRoomsWithDetails ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<ClassRoomDTO> getAllClassRoomsAsDTO() {
        System.out.println("=== DEBUG: ClassRoomService.getAllClassRoomsAsDTO START ===");
        
        try {
            List<ClassRoom> classRooms = classRoomRepository.findAllWithDetails();
            System.out.println("Found " + classRooms.size() + " classrooms");
            
            List<ClassRoomDTO> classRoomDTOs = classRooms.stream()
                .map(ClassRoomDTO::new)
                .toList();
            
            System.out.println("Converted to " + classRoomDTOs.size() + " DTOs");
            System.out.println("=== DEBUG: ClassRoomService.getAllClassRoomsAsDTO SUCCESS ===");
            return classRoomDTOs;
        } catch (Exception e) {
            System.out.println("=== DEBUG: ClassRoomService.getAllClassRoomsAsDTO ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public ClassRoom removeStudentFromClass(Long classId, String email) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Classroom not found"));

        User student = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        classRoom.getStudents().remove(student);
        student.getClassRoomsAsStudent().remove(classRoom);

        return classRoomRepository.save(classRoom);
    }

    @Transactional(readOnly = true)
    public ClassRoomDTO getClassRoomByIdAsDTO(Long id) {
        System.out.println("=== DEBUG: ClassRoomService.getClassRoomByIdAsDTO START ===");
        System.out.println("ClassRoom ID: " + id);
        
        try {
            Optional<ClassRoom> classRoomOpt = classRoomRepository.findByIdWithDetails(id);
            
            if (classRoomOpt.isEmpty()) {
                System.out.println("ClassRoom not found");
                return null;
            }
            
            ClassRoom classRoom = classRoomOpt.get();
            System.out.println("ClassRoom found: " + classRoom.getName());
            
            ClassRoomDTO dto = new ClassRoomDTO(classRoom);
            System.out.println("DTO created successfully");
            System.out.println("=== DEBUG: ClassRoomService.getClassRoomByIdAsDTO SUCCESS ===");
            
            return dto;
        } catch (Exception e) {
            System.out.println("=== DEBUG: ClassRoomService.getClassRoomByIdAsDTO ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}