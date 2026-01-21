package com.collabsphere.repository;

import com.collabsphere.entity.ClassRoom;
import com.collabsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRoomRepository extends JpaRepository<ClassRoom, Long> {
    
    @Query("SELECT c FROM ClassRoom c " +
           "LEFT JOIN FETCH c.lecturer l " +
           "WHERE c.code = :code")
    Optional<ClassRoom> findByCode(@Param("code") String code);
    
    boolean existsByCode(String code);
    
    @Query("SELECT c FROM ClassRoom c " +
           "LEFT JOIN FETCH c.lecturer l " +
           "WHERE c.lecturer = :lecturer")
    List<ClassRoom> findByLecturer(@Param("lecturer") User lecturer);
    
    @Query("SELECT c FROM ClassRoom c " +
           "LEFT JOIN FETCH c.lecturer l " +
           "JOIN c.students s WHERE s.id = :studentId")
    List<ClassRoom> findByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT c FROM ClassRoom c " +
           "LEFT JOIN FETCH c.lecturer l " +
           "WHERE c.name LIKE %:name%")
    List<ClassRoom> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT c FROM ClassRoom c " +
           "LEFT JOIN FETCH c.lecturer l " +
           "LEFT JOIN FETCH c.students s " +
           "WHERE c.id = :id")
    Optional<ClassRoom> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT DISTINCT c FROM ClassRoom c " +
           "LEFT JOIN FETCH c.lecturer l " +
           "ORDER BY c.name ASC")
    List<ClassRoom> findAllWithLecturer();
    
    @Query("SELECT DISTINCT c FROM ClassRoom c " +
           "LEFT JOIN FETCH c.lecturer l " +
           "LEFT JOIN FETCH c.students s " +
           "ORDER BY c.name ASC")
    List<ClassRoom> findAllWithDetails();
}