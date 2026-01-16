package com.collabsphere.service;

import com.collabsphere.dto.AutoGenerateTeamsRequest;
import com.collabsphere.dto.TeamDTO;
import com.collabsphere.entity.Project;
import com.collabsphere.entity.Team;
import com.collabsphere.entity.User;
import com.collabsphere.entity.enums.UserRole;
import com.collabsphere.repository.ProjectRepository;
import com.collabsphere.repository.TeamRepository;
import com.collabsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class TeamService {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Team> autoGenerateTeams(AutoGenerateTeamsRequest request, User user) {
        // Validate user role
        if (user.getRole() != UserRole.LECTURER && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Only lecturers and admins can generate teams");
        }

        // Find project
        Project project = projectRepository.findById(request.getProjectId())
            .orElseThrow(() -> new RuntimeException("Project not found"));

        // Validate lecturer owns the project (unless admin)
        if (user.getRole() == UserRole.LECTURER && 
            !project.getClassRoom().getLecturer().getId().equals(user.getId())) {
            throw new RuntimeException("You can only generate teams for your own projects");
        }

        // Check if teams already exist for this project
        List<Team> existingTeams = teamRepository.findByProjectId(request.getProjectId());
        if (!existingTeams.isEmpty()) {
            throw new RuntimeException("Teams already exist for this project. Please delete existing teams first.");
        }

        // Get students from the classroom
        Set<User> studentsSet = project.getClassRoom().getStudents();
        List<User> students = new ArrayList<>(studentsSet);

        if (students.isEmpty()) {
            throw new RuntimeException("No students found in the classroom");
        }

        if (students.size() < request.getGroupSize()) {
            throw new RuntimeException("Not enough students to form teams of size " + request.getGroupSize());
        }

        // Shuffle students randomly
        Collections.shuffle(students);

        // Generate teams
        List<Team> teams = new ArrayList<>();
        int teamNumber = 1;
        
        for (int i = 0; i < students.size(); i += request.getGroupSize()) {
            int endIndex = Math.min(i + request.getGroupSize(), students.size());
            List<User> teamMembers = students.subList(i, endIndex);

            // Create team
            Team team = new Team();
            team.setName("Team " + teamNumber);
            team.setProject(project);
            
            // Save team first to get ID
            team = teamRepository.save(team);
            
            // Add members to team
            for (User student : teamMembers) {
                team.getMembers().add(student);
                student.getTeams().add(team);
            }
            
            // Save team with members
            team = teamRepository.save(team);
            teams.add(team);
            teamNumber++;
        }

        // Handle remaining students (if any) - add them to existing teams
        int remainingStudents = students.size() % request.getGroupSize();
        if (remainingStudents > 0 && teams.size() > 0) {
            int startIndex = students.size() - remainingStudents;
            List<User> remainingStudentsList = students.subList(startIndex, students.size());
            
            // Distribute remaining students to existing teams
            for (int i = 0; i < remainingStudentsList.size(); i++) {
                Team targetTeam = teams.get(i % teams.size());
                User student = remainingStudentsList.get(i);
                
                targetTeam.getMembers().add(student);
                student.getTeams().add(targetTeam);
                teamRepository.save(targetTeam);
            }
        }

        return teams;
    }

    @Transactional(readOnly = true)
    public List<Team> getTeamsByProject(Long projectId) {
        return teamRepository.findByProjectId(projectId);
    }

    @Transactional(readOnly = true)
    public List<Team> getTeamsByUser(Long userId) {
        return teamRepository.findByMemberId(userId);
    }

    @Transactional(readOnly = true)
    public Optional<Team> getTeamById(Long id) {
        System.out.println("=== DEBUG: TeamService.getTeamById START ===");
        System.out.println("Team ID: " + id);
        
        try {
            Optional<Team> team = teamRepository.findByIdWithDetails(id);
            
            if (team.isPresent()) {
                System.out.println("Team found: " + team.get().getName());
                System.out.println("Members count: " + team.get().getMembers().size());
                if (team.get().getProject() != null) {
                    System.out.println("Project: " + team.get().getProject().getTitle());
                }
            } else {
                System.out.println("Team not found");
            }
            
            System.out.println("=== DEBUG: TeamService.getTeamById SUCCESS ===");
            return team;
        } catch (Exception e) {
            System.out.println("=== DEBUG: TeamService.getTeamById ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Team addMemberToTeam(Long teamId, Long userId) {
        System.out.println("=== DEBUG: TeamService.addMemberToTeam START ===");
        System.out.println("Team ID: " + teamId + ", User ID: " + userId);
        
        try {
            Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
            
            System.out.println("Team found: " + team.getName());
            System.out.println("Current members count: " + team.getMembers().size());

            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("User found: " + user.getFullName());

            // Check if user is a student
            if (user.getRole() != UserRole.STUDENT) {
                throw new RuntimeException("Only students can be added to teams");
            }

            // Check if user is active
            if (user.getActive() == null || !user.getActive()) {
                throw new RuntimeException("User is not active");
            }

            // Check if user is already a member using ID comparison
            boolean alreadyMember = team.getMembers().stream()
                .anyMatch(member -> member.getId().equals(userId));
            
            if (alreadyMember) {
                throw new RuntimeException("User is already a member of this team");
            }

            team.getMembers().add(user);
            user.getTeams().add(team);

            Team savedTeam = teamRepository.save(team);
            System.out.println("Team saved with " + savedTeam.getMembers().size() + " members");
            System.out.println("=== DEBUG: TeamService.addMemberToTeam SUCCESS ===");
            
            return savedTeam;
        } catch (Exception e) {
            System.out.println("=== DEBUG: TeamService.addMemberToTeam ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Team removeMemberFromTeam(Long teamId, Long userId) {
        System.out.println("=== DEBUG: TeamService.removeMemberFromTeam START ===");
        System.out.println("Team ID: " + teamId + ", User ID: " + userId);
        
        try {
            Team team = teamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
            
            System.out.println("Team found: " + team.getName());
            System.out.println("Current members count: " + team.getMembers().size());

            User user = team.getMembers().stream()
                .filter(m -> m.getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User is not a member of this team"));

            System.out.println("User found: " + user.getFullName());

            team.getMembers().remove(user);
            user.getTeams().remove(team);

            Team savedTeam = teamRepository.save(team);
            System.out.println("Team saved with " + savedTeam.getMembers().size() + " members");
            System.out.println("=== DEBUG: TeamService.removeMemberFromTeam SUCCESS ===");
            
            return savedTeam;
        } catch (Exception e) {
            System.out.println("=== DEBUG: TeamService.removeMemberFromTeam ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public void deleteTeamsByProject(Long projectId) {
        List<Team> teams = teamRepository.findByProjectId(projectId);
        for (Team team : teams) {
            // Remove team from all members
            for (User member : team.getMembers()) {
                member.getTeams().remove(team);
            }
            team.getMembers().clear();
        }
        teamRepository.deleteAll(teams);
    }

    public TeamDTO addMemberToTeamAsDTO(Long teamId, Long userId) {
        System.out.println("=== DEBUG: TeamService.addMemberToTeamAsDTO START ===");
        System.out.println("Team ID: " + teamId + ", User ID: " + userId);
        
        try {
            // Validate input parameters
            if (teamId == null || userId == null) {
                System.out.println("ERROR: Null parameters - teamId: " + teamId + ", userId: " + userId);
                throw new RuntimeException("Team ID and User ID cannot be null");
            }
            
            // First, let's check if the team exists
            System.out.println("Step 1: Checking if team exists...");
            Optional<Team> teamOpt = teamRepository.findByIdWithFullDetails(teamId);
            if (teamOpt.isEmpty()) {
                System.out.println("ERROR: Team not found with ID: " + teamId);
                throw new RuntimeException("Team not found with ID: " + teamId);
            }
            
            Team team = teamOpt.get();
            System.out.println("Team found: " + (team.getName() != null ? team.getName() : "NULL NAME"));
            
            // Check if project exists
            System.out.println("Step 2: Checking project...");
            if (team.getProject() == null) {
                System.out.println("ERROR: Team has no project");
                throw new RuntimeException("Team has no associated project");
            }
            System.out.println("Project: " + (team.getProject().getTitle() != null ? team.getProject().getTitle() : "NULL TITLE"));
            
            // Check if classroom exists
            System.out.println("Step 3: Checking classroom...");
            if (team.getProject().getClassRoom() == null) {
                System.out.println("ERROR: Project has no classroom");
                throw new RuntimeException("Project has no associated classroom");
            }
            System.out.println("Classroom: " + (team.getProject().getClassRoom().getName() != null ? team.getProject().getClassRoom().getName() : "NULL NAME"));
            
            // Check classroom students - handle potential null
            System.out.println("Step 4: Checking classroom students...");
            Set<User> classroomStudents = team.getProject().getClassRoom().getStudents();
            if (classroomStudents == null) {
                System.out.println("ERROR: Classroom students set is null");
                throw new RuntimeException("Classroom has no students collection");
            }
            System.out.println("Classroom students count: " + classroomStudents.size());
            
            // Find the specific user
            System.out.println("Step 5: Looking for user ID " + userId + " in classroom students...");
            User user = null;
            int studentCount = 0;
            for (User student : classroomStudents) {
                studentCount++;
                if (student == null) {
                    System.out.println("  WARNING: Found null student in classroom");
                    continue;
                }
                System.out.println("  Student " + studentCount + ": ID=" + student.getId() + ", Name=" + (student.getFullName() != null ? student.getFullName() : "NULL NAME"));
                if (student.getId() != null && student.getId().equals(userId)) {
                    user = student;
                    break;
                }
            }
            
            if (user == null) {
                System.out.println("ERROR: User not found in classroom. User ID: " + userId);
                System.out.println("Available student IDs: ");
                for (User student : classroomStudents) {
                    if (student != null && student.getId() != null) {
                        System.out.println("  - " + student.getId());
                    }
                }
                throw new RuntimeException("User with ID " + userId + " not found in this classroom");
            }
            
            System.out.println("User found: " + (user.getFullName() != null ? user.getFullName() : "NULL NAME"));
            
            // Check if user is already a member - handle potential null members set
            System.out.println("Step 6: Checking if user is already a member...");
            Set<User> teamMembers = team.getMembers();
            if (teamMembers == null) {
                System.out.println("WARNING: Team members set is null, initializing...");
                team.setMembers(new HashSet<>());
                teamMembers = team.getMembers();
            }
            
            if (teamMembers.contains(user)) {
                System.out.println("ERROR: User is already a member");
                throw new RuntimeException("User is already a member of this team");
            }
            
            // Add member
            System.out.println("Step 7: Adding member to team...");
            teamMembers.add(user);
            
            // Handle bidirectional relationship - check if user.teams is null
            Set<Team> userTeams = user.getTeams();
            if (userTeams == null) {
                System.out.println("WARNING: User teams set is null, initializing...");
                user.setTeams(new HashSet<>());
                userTeams = user.getTeams();
            }
            userTeams.add(team);
            
            // Save team
            System.out.println("Step 8: Saving team...");
            Team savedTeam = teamRepository.save(team);
            System.out.println("Team saved successfully with " + savedTeam.getMembers().size() + " members");
            
            // Create DTO with null checks
            System.out.println("Step 9: Creating DTO...");
            TeamDTO dto = new TeamDTO(savedTeam);
            System.out.println("DTO created successfully");
            System.out.println("=== DEBUG: TeamService.addMemberToTeamAsDTO SUCCESS ===");
            return dto;
            
        } catch (Exception e) {
            System.out.println("=== DEBUG: TeamService.addMemberToTeamAsDTO ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            if (e.getCause() != null) {
                System.out.println("Root cause: " + e.getCause().getClass().getSimpleName() + " - " + e.getCause().getMessage());
            }
            e.printStackTrace();
            throw e;
        }
    }

    public TeamDTO removeMemberFromTeamAsDTO(Long teamId, Long userId) {
        System.out.println("=== DEBUG: TeamService.removeMemberFromTeamAsDTO START ===");
        
        try {
            Team team = removeMemberFromTeam(teamId, userId);
            TeamDTO dto = new TeamDTO(team);
            System.out.println("DTO created successfully");
            System.out.println("=== DEBUG: TeamService.removeMemberFromTeamAsDTO SUCCESS ===");
            return dto;
        } catch (Exception e) {
            System.out.println("=== DEBUG: TeamService.removeMemberFromTeamAsDTO ERROR ===");
            e.printStackTrace();
            throw e;
        }
    }
}