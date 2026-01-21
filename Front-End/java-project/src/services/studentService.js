import axios from '../config/axios';

// Helper function to extract data from ApiResponse wrapper
const extractData = (response) => {
  // If response has data.data (ApiResponse wrapper), return data.data
  // Otherwise return data directly
  return response.data?.data !== undefined ? response.data.data : response.data;
};

const studentService = {
  // ==================== PROJECT APIs ====================
  
  getProjectsByClassroom: async (classroomId) => {
    const response = await axios.get(`/api/projects/classroom/${classroomId}`);
    return extractData(response);
  },

  getProjectById: async (projectId) => {
    const response = await axios.get(`/api/projects/${projectId}`);
    return extractData(response);
  },

  getProjectMilestones: async (projectId) => {
    const response = await axios.get(`/api/projects/${projectId}/milestones`);
    return extractData(response);
  },

  getApprovedProjects: async () => {
    const response = await axios.get('/api/projects/approved');
    return extractData(response);
  },

  // ==================== TEAM APIs ====================
  
  getTeamsByProject: async (projectId) => {
    const response = await axios.get(`/api/teams/project/${projectId}`);
    return extractData(response);
  },

  getMyTeams: async () => {
    const response = await axios.get('/api/teams/my');
    return extractData(response);
  },

  getTeamById: async (teamId) => {
    const response = await axios.get(`/api/teams/${teamId}`);
    return extractData(response);
  },

  // ==================== TASK APIs ====================
  
  createTask: async (taskData) => {
    const response = await axios.post('/api/tasks', taskData);
    return extractData(response);
  },

  updateTaskStatus: async (taskId, status) => {
    const response = await axios.put(`/api/tasks/${taskId}/status`, { status });
    return extractData(response);
  },

  assignTask: async (taskId, assigneeId) => {
    const response = await axios.put(`/api/tasks/${taskId}/assign`, { assigneeId });
    return extractData(response);
  },

  updateTask: async (taskId, taskData) => {
    const response = await axios.put(`/api/tasks/${taskId}`, taskData);
    return extractData(response);
  },

  deleteTask: async (taskId) => {
    const response = await axios.delete(`/api/tasks/${taskId}`);
    return extractData(response);
  },

  getTeamTasks: async (teamId) => {
    const response = await axios.get(`/api/tasks/teams/${teamId}`);
    return extractData(response);
  },

  getKanbanBoard: async (teamId) => {
    const response = await axios.get(`/api/tasks/teams/${teamId}/kanban`);
    return extractData(response);
  },

  getTasksByStatus: async (teamId, status) => {
    const response = await axios.get(`/api/tasks/teams/${teamId}/status/${status}`);
    return extractData(response);
  },

  getOverdueTasks: async (teamId) => {
    const response = await axios.get(`/api/tasks/teams/${teamId}/overdue`);
    return extractData(response);
  },

  getMyTasks: async () => {
    const response = await axios.get('/api/tasks/my');
    return extractData(response);
  },

  getMyTasksDTO: async () => {
    const response = await axios.get('/api/tasks/my/dto');
    return extractData(response);
  },

  getMyTasksByStatus: async (status) => {
    const response = await axios.get(`/api/tasks/my/status/${status}`);
    return extractData(response);
  },

  getTaskById: async (taskId) => {
    const response = await axios.get(`/api/tasks/${taskId}`);
    return extractData(response);
  },

  // ==================== CHAT APIs ====================
  
  getChatHistory: async (teamId, page = 0, size = 50) => {
    const response = await axios.get(`/api/chat/api/teams/${teamId}/messages`, {
      params: { page, size }
    });
    return extractData(response);
  },

  getNewMessages: async (teamId, since) => {
    const response = await axios.get(`/api/chat/api/teams/${teamId}/messages/since`, {
      params: { since }
    });
    return extractData(response);
  },

  // ==================== WHITEBOARD APIs ====================
  
  getWhiteboardData: async (teamId) => {
    const response = await axios.get(`/api/whiteboards/${teamId}`);
    return extractData(response);
  },

  saveWhiteboardData: async (teamId, dataJson) => {
    const response = await axios.post(`/api/whiteboards/${teamId}`, { dataJson });
    return extractData(response);
  },

  // ==================== FILE APIs ====================
  
  uploadFile: async (file, description = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    
    const response = await axios.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return extractData(response);
  },

  downloadFile: async (filename) => {
    const response = await axios.get(`/files/uploads/${filename}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // ==================== GRADING & RUBRIC APIs ====================
  
  getProjectRubrics: async (projectId) => {
    const response = await axios.get(`/api/rubrics/project/${projectId}`);
    return extractData(response);
  },

  getRubricCriteria: async (rubricId) => {
    const response = await axios.get(`/api/rubrics/${rubricId}/criteria`);
    return extractData(response);
  },

  getTeamScores: async (teamId) => {
    const response = await axios.get(`/api/rubrics/team/${teamId}/scores`);
    return extractData(response);
  },

  getTeamTotalScore: async (teamId, rubricId) => {
    const response = await axios.get(`/api/rubrics/team/${teamId}/rubric/${rubricId}/total`);
    return extractData(response);
  }
};

export default studentService;
