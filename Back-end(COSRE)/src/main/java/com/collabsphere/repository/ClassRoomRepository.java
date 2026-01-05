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
    
    Optional<ClassRoom> findByCode(String code);
    
    boolean existsByCode(String code);
    
    List<ClassRoom> findByLecturer(User lecturer);
    
    @Query("SELECT c FROM ClassRoom c JOIN c.students s WHERE s.id = :studentId")
    List<ClassRoom> findByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT c FROM ClassRoom c WHERE c.name LIKE %:name%")
    List<ClassRoom> findByNameContaining(@Param("name") String name);
}