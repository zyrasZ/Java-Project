package com.collabsphere.service;

import com.collabsphere.dto.CreateMilestoneRequest;
import com.collabsphere.dto.CreateProjectRequest;
import com.collabsphere.dto.ProjectDTO;
import com.collabsphere.entity.ClassRoom;
import com.collabsphere.entity.Milestone;
import com.collabsphere.entity.Project;
import com.collabsphere.entity.User;
import com.collabsphere.entity.enums.ProjectStatus;
import com.collabsphere.entity.enums.UserRole;
import com.collabsphere.repository.ClassRoomRepository;
import com.collabsphere.repository.MilestoneRepository;
import com.collabsphere.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ClassRoomRepository classRoomRepository;

    @Autowired
    private MilestoneRepository milestoneRepository;

    public Project createProject(CreateProjectRequest request, User user) {
        if (user.getRole() != UserRole.LECTURER && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Only lecturers and admins can create projects");
        }

        ClassRoom classRoom = classRoomRepository.findById(request.getClassroomId())
            .orElseThrow(() -> new RuntimeException("Classroom not found"));

        if (user.getRole() == UserRole.LECTURER && !classRoom.getLecturer().getId().equals(user.getId())) {
            throw new RuntimeException("You can only create projects for your own classrooms");
        }

        if (request.getDeadline().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Project deadline must be in the future");
        }

        Project project = new Project();
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setDeadline(request.getDeadline());
        project.setClassRoom(classRoom);
        project.setStatus(ProjectStatus.DRAFT);

        return projectRepository.save(project);
    }

    @Transactional(readOnly = true)
    public List<Project> getProjectsByClassroom(Long classroomId) {
        return projectRepository.findByClassRoomId(classroomId);
    }

    @Transactional(readOnly = true)
    public List<Project> getProjectsByLecturer(User lecturer) {
        System.out.println("=== DEBUG: ProjectService.getProjectsByLecturer START ===");
        System.out.println("Lecturer ID: " + lecturer.getId());
        System.out.println("Lecturer Email: " + lecturer.getEmail());
        
        try {
            List<Project> projects = projectRepository.findByLecturerId(lecturer.getId());
            System.out.println("Found " + projects.size() + " projects");
            
            // Test accessing lazy properties to ensure they're loaded
            for (Project project : projects) {
                System.out.println("Project: " + project.getTitle());
                if (project.getClassRoom() != null) {
                    System.out.println("  ClassRoom: " + project.getClassRoom().getName());
                    if (project.getClassRoom().getLecturer() != null) {
                        System.out.println("  Lecturer: " + project.getClassRoom().getLecturer().getFullName());
                    }
                }
            }
            
            System.out.println("=== DEBUG: ProjectService.getProjectsByLecturer SUCCESS ===");
            return projects;
        } catch (Exception e) {
            System.out.println("=== DEBUG: ProjectService.getProjectsByLecturer ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Project> getPendingProjects() {
        return projectRepository.findByStatus(ProjectStatus.PENDING);
    }
    
    @Transactional(readOnly = true)
    public List<Project> getApprovedProjects() {
        return projectRepository.findByStatus(ProjectStatus.APPROVED);
    }

    public Project submitProject(Long projectId, User lecturer) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (!project.getClassRoom().getLecturer().getId().equals(lecturer.getId())) {
            throw new RuntimeException("You can only submit your own projects");
        }
        
        if (project.getStatus() != ProjectStatus.DRAFT) {
            throw new RuntimeException("Only draft projects can be submitted");
        }
        
        project.setStatus(ProjectStatus.PENDING);
        return projectRepository.save(project);
    }
    
    public Project approveProject(Long projectId, User approver, String comment) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (project.getStatus() != ProjectStatus.PENDING) {
            throw new RuntimeException("Only pending projects can be approved");
        }
        
        project.setStatus(ProjectStatus.APPROVED);
        return projectRepository.save(project);
    }
    
    public Project rejectProject(Long projectId, User rejector, String reason) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));
        
        if (project.getStatus() != ProjectStatus.PENDING) {
            throw new RuntimeException("Only pending projects can be rejected");
        }
        
        project.setStatus(ProjectStatus.REJECTED);
        return projectRepository.save(project);
    }

    // MILESTONE MANAGEMENT METHODS
    public Milestone createMilestone(Long projectId, CreateMilestoneRequest request, User user) {
        // Find project
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));

        // Validate user can create milestones for this project
        if (user.getRole() == UserRole.LECTURER && 
            !project.getClassRoom().getLecturer().getId().equals(user.getId())) {
            throw new RuntimeException("You can only create milestones for your own projects");
        }

        // Validate due date is in the future
        if (request.getDueDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Milestone due date must be in the future");
        }

        Milestone milestone = new Milestone();
        milestone.setTitle(request.getTitle());
        milestone.setDueDate(request.getDueDate());
        milestone.setProject(project);

        return milestoneRepository.save(milestone);
    }

    public List<Milestone> getMilestonesByProject(Long projectId) {
        return milestoneRepository.findByProjectId(projectId);
    }

    @Transactional(readOnly = true)
    public List<Project> getActiveProjects(Long classroomId) {
        return projectRepository.findActiveProjectsByClassroom(classroomId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<ProjectDTO> getProjectsByLecturerAsDTO(User lecturer) {
        System.out.println("=== DEBUG: ProjectService.getProjectsByLecturerAsDTO START ===");
        System.out.println("Lecturer ID: " + lecturer.getId());
        
        try {
            List<Project> projects = projectRepository.findByLecturerId(lecturer.getId());
            System.out.println("Found " + projects.size() + " projects");
            
            List<ProjectDTO> projectDTOs = projects.stream()
                .map(ProjectDTO::new)
                .toList();
            
            System.out.println("Converted to " + projectDTOs.size() + " DTOs");
            System.out.println("=== DEBUG: ProjectService.getProjectsByLecturerAsDTO SUCCESS ===");
            return projectDTOs;
        } catch (Exception e) {
            System.out.println("=== DEBUG: ProjectService.getProjectsByLecturerAsDTO ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<Milestone> getUpcomingMilestones(Long projectId) {
        return milestoneRepository.findUpcomingMilestones(projectId, LocalDateTime.now());
    }
}