package com.collabsphere.service;

import com.collabsphere.dto.ImportClassroomResult;
import com.collabsphere.dto.ImportUserResult;
import com.collabsphere.entity.ClassRoom;
import com.collabsphere.entity.User;
import com.collabsphere.entity.enums.UserRole;
import com.collabsphere.repository.ClassRoomRepository;
import com.collabsphere.repository.UserRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StaffService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ClassRoomRepository classRoomRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public ImportUserResult importUsersFromExcel(MultipartFile file) throws IOException {
        List<User> newUsers = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int processedRows = 0;
        int createdUsers = 0;
        int skippedUsers = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Bỏ qua header row (row 0)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                processedRows++;
                
                try {
                    // Đọc dữ liệu từ các cột
                    // Cột A: Email, Cột B: Full Name, Cột C: Role, Cột D: Password (optional)
                    String email = getCellValueAsString(row.getCell(0));
                    String fullName = getCellValueAsString(row.getCell(1));
                    String roleStr = getCellValueAsString(row.getCell(2));
                    String password = getCellValueAsString(row.getCell(3));
                    
                    // Validate dữ liệu
                    if (email == null || email.trim().isEmpty()) {
                        errors.add("Dòng " + (i + 1) + ": Email không được để trống");
                        continue;
                    }
                    
                    if (fullName == null || fullName.trim().isEmpty()) {
                        errors.add("Dòng " + (i + 1) + ": Họ tên không được để trống");
                        continue;
                    }
                    
                    // Kiểm tra email đã tồn tại
                    Optional<User> existingUser = userRepository.findByEmail(email.trim());
                    if (existingUser.isPresent()) {
                        skippedUsers++;
                        continue;
                    }
                    
                    // Parse role
                    UserRole role;
                    try {
                        role = UserRole.valueOf(roleStr.toUpperCase().trim());
                    } catch (Exception e) {
                        role = UserRole.STUDENT; // Default role
                    }
                    
                    // Set default password nếu không có
                    if (password == null || password.trim().isEmpty()) {
                        password = "123456"; // Default password
                    }
                    
                    // Tạo user mới
                    User newUser = new User();
                    newUser.setEmail(email.trim());
                    newUser.setFullName(fullName.trim());
                    newUser.setRole(role);
                    newUser.setPassword(passwordEncoder.encode(password));
                    newUser.setActive(true);
                    
                    newUsers.add(newUser);
                    createdUsers++;
                    
                } catch (Exception e) {
                    errors.add("Dòng " + (i + 1) + ": " + e.getMessage());
                }
            }
        }
        
        // Lưu tất cả users mới
        List<User> savedUsers = new ArrayList<>();
        if (!newUsers.isEmpty()) {
            savedUsers = userRepository.saveAll(newUsers);
        }
        
        // Chuyển đổi sang DTO
        List<ImportUserResult.ImportedUserInfo> importedUserInfos = savedUsers.stream()
            .map(user -> new ImportUserResult.ImportedUserInfo(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getActive()
            ))
            .collect(Collectors.toList());
        
        // Tạo kết quả
        return new ImportUserResult(
            processedRows,
            createdUsers,
            skippedUsers,
            errors,
            importedUserInfos
        );
    }

    public ImportClassroomResult importClassroomsFromExcel(MultipartFile file) throws IOException {
        List<ClassRoom> newClassrooms = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int processedRows = 0;
        int createdClassrooms = 0;
        int skippedClassrooms = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Bỏ qua header row (row 0)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                processedRows++;
                
                try {
                    // Đọc dữ liệu từ các cột
                    // Cột A: Class Name, Cột B: Class Code, Cột C: Lecturer Email
                    String className = getCellValueAsString(row.getCell(0));
                    String classCode = getCellValueAsString(row.getCell(1));
                    String lecturerEmail = getCellValueAsString(row.getCell(2));
                    
                    // Validate dữ liệu
                    if (className == null || className.trim().isEmpty()) {
                        errors.add("Dòng " + (i + 1) + ": Tên lớp không được để trống");
                        continue;
                    }
                    
                    if (classCode == null || classCode.trim().isEmpty()) {
                        errors.add("Dòng " + (i + 1) + ": Mã lớp không được để trống");
                        continue;
                    }
                    
                    // Kiểm tra class code đã tồn tại
                    Optional<ClassRoom> existingClass = classRoomRepository.findByCode(classCode.trim());
                    if (existingClass.isPresent()) {
                        skippedClassrooms++;
                        continue;
                    }
                    
                    // Tìm lecturer
                    User lecturer = null;
                    if (lecturerEmail != null && !lecturerEmail.trim().isEmpty()) {
                        Optional<User> lecturerOpt = userRepository.findByEmail(lecturerEmail.trim());
                        if (lecturerOpt.isPresent() && 
                            (lecturerOpt.get().getRole() == UserRole.LECTURER || 
                             lecturerOpt.get().getRole() == UserRole.ADMIN)) {
                            lecturer = lecturerOpt.get();
                        } else {
                            errors.add("Dòng " + (i + 1) + ": Không tìm thấy giảng viên với email " + lecturerEmail);
                            continue;
                        }
                    }
                    
                    // Tạo classroom mới
                    ClassRoom newClassroom = new ClassRoom();
                    newClassroom.setName(className.trim());
                    newClassroom.setCode(classCode.trim());
                    newClassroom.setLecturer(lecturer);
                    
                    newClassrooms.add(newClassroom);
                    createdClassrooms++;
                    
                } catch (Exception e) {
                    errors.add("Dòng " + (i + 1) + ": " + e.getMessage());
                }
            }
        }
        
        // Lưu tất cả classrooms mới
        List<ClassRoom> savedClassrooms = new ArrayList<>();
        if (!newClassrooms.isEmpty()) {
            savedClassrooms = classRoomRepository.saveAll(newClassrooms);
        }
        
        // Chuyển đổi sang DTO
        List<ImportClassroomResult.ImportedClassroomInfo> importedClassroomInfos = savedClassrooms.stream()
            .map(classroom -> new ImportClassroomResult.ImportedClassroomInfo(
                classroom.getId(),
                classroom.getName(),
                classroom.getCode(),
                classroom.getLecturer() != null ? classroom.getLecturer().getFullName() : null,
                classroom.getLecturer() != null ? classroom.getLecturer().getEmail() : null
            ))
            .collect(Collectors.toList());
        
        // Tạo kết quả
        return new ImportClassroomResult(
            processedRows,
            createdClassrooms,
            skippedClassrooms,
            errors,
            importedClassroomInfos
        );
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return null;
        }
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    return String.valueOf((long) cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return null;
        }
    }
}