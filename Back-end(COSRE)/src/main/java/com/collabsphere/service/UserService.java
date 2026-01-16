package com.collabsphere.service;

import com.collabsphere.dto.*;
import com.collabsphere.entity.User;
import com.collabsphere.entity.enums.UserRole;
import com.collabsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Page<User> getAllUsers(String keyword, UserRole role, Boolean active, 
                                 int page, int size, String sortBy, String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        if (keyword != null && !keyword.trim().isEmpty()) {
            if (role != null && active != null) {
                return userRepository.findByKeywordAndRoleAndActive(keyword, role, active, pageable);
            } else if (role != null) {
                return userRepository.findByKeywordAndRole(keyword, role, pageable);
            } else if (active != null) {
                return userRepository.findByKeywordAndActive(keyword, active, pageable);
            } else {
                return userRepository.findByKeyword(keyword, pageable);
            }
        } else {
            if (role != null && active != null) {
                return userRepository.findByRoleAndActive(role, active, pageable);
            } else if (role != null) {
                return userRepository.findByRole(role, pageable);
            } else if (active != null) {
                return userRepository.findByActive(active, pageable);
            } else {
                return userRepository.findAll(pageable);
            }
        }
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User createUser(CreateUserRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(request.getRole());
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public User createStaffUser(CreateStaffRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại trong hệ thống");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(UserRole.STAFF);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        return userRepository.save(user);
    }

    public User updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if email is being changed and if it already exists
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getRole() != null) {
            validateRoleChange(user, request.getRole());
            user.setRole(request.getRole());
        }

        if (request.getActive() != null) {
            validateStatusChange(user, request.getActive());
            user.setActive(request.getActive());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        validateUserDeletion(user);
        user.setActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public void permanentDeleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        validateUserDeletion(user);
        userRepository.delete(user);
    }

    public User changeUserRole(Long id, ChangeRoleRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        validateRoleChange(user, request.getRole());
        user.setRole(request.getRole());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User changeUserPassword(Long id, ChangePasswordRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        validateStatusChange(user, !user.getActive());
        user.setActive(!user.getActive());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public List<User> searchUsers(String keyword) {
        return userRepository.findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(keyword, keyword);
    }

    public List<User> getUsersByRole(UserRole role, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findByRole(role, pageable).getContent();
    }

    public List<User> getActiveUsersByRole(UserRole role) {
        return userRepository.findByRoleAndActive(role, true);
    }

    public UserStatisticsResponse getUserStatistics() {
        Map<String, Long> byRole = new HashMap<>();
        Map<String, Long> byStatus = new HashMap<>();

        // Statistics by role
        for (UserRole role : UserRole.values()) {
            long count = userRepository.countByRole(role);
            byRole.put(role.name(), count);
        }

        // Statistics by status
        long activeCount = userRepository.countByActive(true);
        long inactiveCount = userRepository.countByActive(false);
        byStatus.put("active", activeCount);
        byStatus.put("inactive", inactiveCount);

        long total = userRepository.count();

        return new UserStatisticsResponse(byRole, byStatus, total);
    }

    public BulkUpdateResult bulkUpdateStatus(BulkUpdateStatusRequest request) {
        int success = 0;
        int failed = 0;

        for (Long userId : request.getUserIds()) {
            try {
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    validateStatusChange(user, request.getActive());
                    user.setActive(request.getActive());
                    user.setUpdatedAt(LocalDateTime.now());
                    userRepository.save(user);
                    success++;
                } else {
                    failed++;
                }
            } catch (Exception e) {
                failed++;
            }
        }

        return new BulkUpdateResult(success, failed, request.getUserIds().size());
    }

    public List<String> getAllRoles() {
        return Arrays.stream(UserRole.values())
                .map(Enum::name)
                .toList();
    }

    public void updateLastLogin(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    // Validation methods
    private void validateRoleChange(User user, UserRole newRole) {
        // Cannot change role of the last admin
        if (user.getRole() == UserRole.ADMIN && newRole != UserRole.ADMIN) {
            long adminCount = userRepository.countByRoleAndActive(UserRole.ADMIN, true);
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot change role of the last active admin");
            }
        }
    }

    private void validateStatusChange(User user, Boolean newStatus) {
        // Cannot deactivate the last admin
        if (user.getRole() == UserRole.ADMIN && !newStatus) {
            long activeAdminCount = userRepository.countByRoleAndActive(UserRole.ADMIN, true);
            if (activeAdminCount <= 1) {
                throw new RuntimeException("Cannot deactivate the last active admin");
            }
        }
    }

    private void validateUserDeletion(User user) {
        // Cannot delete the last admin
        if (user.getRole() == UserRole.ADMIN) {
            long activeAdminCount = userRepository.countByRoleAndActive(UserRole.ADMIN, true);
            if (activeAdminCount <= 1) {
                throw new RuntimeException("Cannot delete the last active admin");
            }
        }
    }
}