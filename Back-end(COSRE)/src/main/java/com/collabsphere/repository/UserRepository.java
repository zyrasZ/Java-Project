package com.collabsphere.repository;

import com.collabsphere.entity.User;
import com.collabsphere.entity.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(UserRole role);
    
    Page<User> findByRole(UserRole role, Pageable pageable);
    
    List<User> findByRoleAndActive(UserRole role, Boolean active);
    
    Page<User> findByRoleAndActive(UserRole role, Boolean active, Pageable pageable);
    
    Page<User> findByActive(Boolean active, Pageable pageable);
    
    List<User> findByActiveTrue();
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.active = true")
    List<User> findActiveUsersByRole(@Param("role") UserRole role);
    
    @Query("SELECT u FROM User u WHERE u.fullName LIKE %:name% AND u.active = true")
    List<User> findByFullNameContainingAndActiveTrue(@Param("name") String name);
    
    // Search methods
    List<User> findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(String email, String fullName);
    
    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<User> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "u.role = :role")
    Page<User> findByKeywordAndRole(@Param("keyword") String keyword, @Param("role") UserRole role, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "u.active = :active")
    Page<User> findByKeywordAndActive(@Param("keyword") String keyword, @Param("active") Boolean active, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "u.role = :role AND u.active = :active")
    Page<User> findByKeywordAndRoleAndActive(@Param("keyword") String keyword, @Param("role") UserRole role, @Param("active") Boolean active, Pageable pageable);
    
    // Count methods for statistics
    long countByRole(UserRole role);
    
    long countByActive(Boolean active);
    
    long countByRoleAndActive(UserRole role, Boolean active);
}