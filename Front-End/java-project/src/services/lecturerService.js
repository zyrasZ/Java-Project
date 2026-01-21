import axiosInstance from '../config/axios';

/**
 * Lecturer Service - API calls for Lecturer role
 * Based on FRONTEND_API_DOCUMENTATION.md
 */

const lecturerService = {
  // ==================== CLASSROOM MANAGEMENT ====================
  // Base: /api/admin/classes (LECTURER has access)
  
  /**
   * Get my classes
   * GET /api/admin/classes
   * Returns: List of classes that lecturer is teaching
   */
  getMyClasses: () => axiosInstance.get('/api/admin/classes'),
  
  /**
   * Create class
   * POST /api/admin/classes
   * Body: { name, code }
   */
  createClass: (data) => axiosInstance.post('/api/admin/classes', data),
  
  /**
   * Get class by ID
   * GET /api/admin/classes/{id}
   */
  getClassById: (id) => axiosInstance.get(`/api/admin/classes/${id}`),
  
  /**
   * Get class by code
   * GET /api/admin/classes/code/{code}
   */
  getClassByCode: (code) => axiosInstance.get(`/api/admin/classes/code/${code}`),
  
  /**
   * Add student to class
   * POST /api/admin/classes/{id}/students
   * Body: { email }
   */
  addStudentToClass: (classId, email) => 
    axiosInstance.post(`/api/admin/classes/${classId}/students`, { email }),
  
  /**
   * Remove student from class
   * DELETE /api/admin/classes/{id}/students?email=student@example.com
   */
  removeStudentFromClass: (classId, email) => 
    axiosInstance.delete(`/api/admin/classes/${classId}/students`, { params: { email } }),

  // ==================== PROJECT MANAGEMENT ====================
  // Base: /api/projects
  
  /**
   * Get my projects (LECTURER only)
   * GET /api/projects/my
   */
  getMyProjects: () => axiosInstance.get('/api/projects/my'),
  
  /**
   * Create project
   * POST /api/projects
   * Body: { title, description, deadline, classroomId }
   */
  createProject: (data) => axiosInstance.post('/api/projects', data),
  
  /**
   * Get project by ID
   * GET /api/projects/{id}
   */
  getProjectById: (id) => axiosInstance.get(`/api/projects/${id}`),
  
  /**
   * Get projects by classroom
   * GET /api/projects/classroom/{classroomId}
   */
  getProjectsByClassroom: (classroomId) => 
    axiosInstance.get(`/api/projects/classroom/${classroomId}`),
  
  /**
   * Create milestone
   * POST /api/projects/{id}/milestones
   * Body: { title, description, dueDate }
   */
  createMilestone: (projectId, data) => 
    axiosInstance.post(`/api/projects/${projectId}/milestones`, data),
  
  /**
   * Get milestones
   * GET /api/projects/{id}/milestones
   */
  getMilestones: (projectId) => 
    axiosInstance.get(`/api/projects/${projectId}/milestones`),
  
  /**
   * Submit project for approval (LECTURER)
   * PUT /api/projects/{id}/submit
   */
  submitProject: (projectId) => 
    axiosInstance.put(`/api/projects/${projectId}/submit`),

  // ==================== TEAM MANAGEMENT ====================
  // Base: /api/teams
  
  /**
   * Auto generate teams
   * POST /api/teams/auto-generate
   * Body: { projectId, teamSize }
   */
  autoGenerateTeams: (data) => 
    axiosInstance.post('/api/teams/auto-generate', data),
  
  /**
   * Get teams by project
   * GET /api/teams/project/{projectId}
   */
  getTeamsByProject: (projectId) => 
    axiosInstance.get(`/api/teams/project/${projectId}`),
  
  /**
   * Get my teams
   * GET /api/teams/my
   */
  getMyTeams: () => axiosInstance.get('/api/teams/my'),
  
  /**
   * Get team by ID
   * GET /api/teams/{id}
   */
  getTeamById: (id) => axiosInstance.get(`/api/teams/${id}`),
  
  /**
   * Add member to team
   * POST /api/teams/{teamId}/members/{userId}
   */
  addMemberToTeam: (teamId, userId) => 
    axiosInstance.post(`/api/teams/${teamId}/members/${userId}`),
  
  /**
   * Remove member from team
   * DELETE /api/teams/{teamId}/members/{userId}
   */
  removeMemberFromTeam: (teamId, userId) => 
    axiosInstance.delete(`/api/teams/${teamId}/members/${userId}`),
  
  /**
   * Delete all teams of project
   * DELETE /api/teams/project/{projectId}
   */
  deleteAllTeams: (projectId) => 
    axiosInstance.delete(`/api/teams/project/${projectId}`),

  // ==================== TASK MANAGEMENT ====================
  // Base: /api/tasks
  
  /**
   * Create task
   * POST /api/tasks
   * Body: { title, description, teamId, priority, dueDate, assigneeId }
   */
  createTask: (data) => axiosInstance.post('/api/tasks', data),
  
  /**
   * Update task status
   * PUT /api/tasks/{id}/status
   * Body: { status } - TODO, DOING, DONE
   */
  updateTaskStatus: (taskId, status) => 
    axiosInstance.put(`/api/tasks/${taskId}/status`, { status }),
  
  /**
   * Assign task
   * PUT /api/tasks/{id}/assign
   * Body: { assigneeId }
   */
  assignTask: (taskId, assigneeId) => 
    axiosInstance.put(`/api/tasks/${taskId}/assign`, { assigneeId }),
  
  /**
   * Update task
   * PUT /api/tasks/{id}
   * Body: { title, description, priority, dueDate }
   */
  updateTask: (taskId, data) => 
    axiosInstance.put(`/api/tasks/${taskId}`, data),
  
  /**
   * Delete task
   * DELETE /api/tasks/{id}
   */
  deleteTask: (taskId) => axiosInstance.delete(`/api/tasks/${taskId}`),
  
  /**
   * Get team tasks
   * GET /api/tasks/teams/{teamId}
   */
  getTeamTasks: (teamId) => 
    axiosInstance.get(`/api/tasks/teams/${teamId}`),
  
  /**
   * Get kanban board
   * GET /api/tasks/teams/{teamId}/kanban
   * Returns: { TODO: [], DOING: [], DONE: [] }
   */
  getKanbanBoard: (teamId) => 
    axiosInstance.get(`/api/tasks/teams/${teamId}/kanban`),
  
  /**
   * Get tasks by status
   * GET /api/tasks/teams/{teamId}/status/{status}
   */
  getTasksByStatus: (teamId, status) => 
    axiosInstance.get(`/api/tasks/teams/${teamId}/status/${status}`),
  
  /**
   * Get overdue tasks
   * GET /api/tasks/teams/{teamId}/overdue
   */
  getOverdueTasks: (teamId) => 
    axiosInstance.get(`/api/tasks/teams/${teamId}/overdue`),
  
  /**
   * Get my tasks
   * GET /api/tasks/my
   */
  getMyTasks: () => axiosInstance.get('/api/tasks/my'),
  
  /**
   * Get my tasks (DTO format - for debugging)
   * GET /api/tasks/my/dto
   */
  getMyTasksDto: () => axiosInstance.get('/api/tasks/my/dto'),
  
  /**
   * Get my tasks by status
   * GET /api/tasks/my/status/{status}
   */
  getMyTasksByStatus: (status) => 
    axiosInstance.get(`/api/tasks/my/status/${status}`),
  
  /**
   * Get task by ID
   * GET /api/tasks/{id}
   */
  getTaskById: (taskId) => axiosInstance.get(`/api/tasks/${taskId}`),

  // ==================== GRADING & RUBRIC ====================
  // Base: /api/rubrics
  
  /**
   * Create rubric
   * POST /api/rubrics
   * Body: { name, description, projectId }
   */
  createRubric: (data) => axiosInstance.post('/api/rubrics', data),
  
  /**
   * Add criteria to rubric
   * POST /api/rubrics/{rubricId}/criteria
   * Body: { name, description, weight, maxScore }
   */
  addCriteria: (rubricId, data) => 
    axiosInstance.post(`/api/rubrics/${rubricId}/criteria`, data),
  
  /**
   * Grade by rubric
   * POST /api/rubrics/grades/rubric
   * Body: { teamId, rubricId, scores: [{ criteriaId, score, feedback }] }
   */
  gradeByRubric: (data) => 
    axiosInstance.post('/api/rubrics/grades/rubric', data),
  
  /**
   * Get project rubrics
   * GET /api/rubrics/project/{projectId}
   */
  getProjectRubrics: (projectId) => 
    axiosInstance.get(`/api/rubrics/project/${projectId}`),
  
  /**
   * Get rubric criteria
   * GET /api/rubrics/{rubricId}/criteria
   */
  getRubricCriteria: (rubricId) => 
    axiosInstance.get(`/api/rubrics/${rubricId}/criteria`),
  
  /**
   * Get team scores
   * GET /api/rubrics/team/{teamId}/scores
   */
  getTeamScores: (teamId) => 
    axiosInstance.get(`/api/rubrics/team/${teamId}/scores`),
  
  /**
   * Get team total score
   * GET /api/rubrics/team/{teamId}/rubric/{rubricId}/total
   */
  getTeamTotalScore: (teamId, rubricId) => 
    axiosInstance.get(`/api/rubrics/team/${teamId}/rubric/${rubricId}/total`),

  // ==================== CHAT & COMMUNICATION ====================
  // Base: /api/chat/api/teams (Note: có /api/chat/api prefix)
  
  /**
   * Get chat history
   * GET /api/chat/api/teams/{teamId}/messages?page=0&size=50
   */
  getChatHistory: (teamId, page = 0, size = 50) => 
    axiosInstance.get(`/api/chat/api/teams/${teamId}/messages`, { 
      params: { page, size } 
    }),
  
  /**
   * Get recent messages
   * GET /api/chat/api/teams/{teamId}/messages/since?since=2024-11-20T15:00:00
   */
  getRecentMessages: (teamId, since) => 
    axiosInstance.get(`/api/chat/api/teams/${teamId}/messages/since`, { 
      params: { since } 
    }),
  
  /**
   * Get whiteboard data
   * GET /api/whiteboards/{teamId}
   */
  getWhiteboardData: (teamId) => 
    axiosInstance.get(`/api/whiteboards/${teamId}`),
  
  /**
   * Save whiteboard data
   * POST /api/whiteboards/{teamId}
   * Body: { dataJson }
   */
  saveWhiteboardData: (teamId, data) => 
    axiosInstance.post(`/api/whiteboards/${teamId}`, data),

  // ==================== FILE MANAGEMENT ====================
  // Base: /files
  
  /**
   * Upload file
   * POST /files/upload
   * Content-Type: multipart/form-data
   */
  uploadFile: (file, description) => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    return axiosInstance.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  /**
   * Download file
   * GET /files/uploads/{filename}
   */
  downloadFile: (filename) => 
    axiosInstance.get(`/files/uploads/${filename}`, { 
      responseType: 'blob' 
    }),

  // ==================== WEBSOCKET (for reference) ====================
  /**
   * WebSocket Connection: ws://localhost:8080/ws
   * 
   * Subscriptions:
   * - /topic/team/{teamId} - Team chat messages
   * - /topic/whiteboard/{teamId} - Whiteboard updates
   * 
   * Send destinations:
   * - /app/chat/{teamId} - Send chat message
   * - /app/whiteboard/{teamId} - Send draw event
   */
  /**
   * Grade team (simple version - direct score)
   * POST /api/teams/{teamId}/grade
   */
  gradeTeam: (teamId, data) => 
    axiosInstance.post(`/api/teams/${teamId}/grade`, data),
};

export default lecturerService;
