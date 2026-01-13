import axiosInstance from '../config/axios';

export const adminService = {
  // User Management APIs
  getAllUsers: async (params = {}) => {
    const response = await axiosInstance.get('/api/admin/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await axiosInstance.get(`/api/admin/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await axiosInstance.post('/api/admin/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await axiosInstance.put(`/api/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/api/admin/users/${id}`);
    return response.data;
  },

  permanentDeleteUser: async (id) => {
    const response = await axiosInstance.delete(`/api/admin/users/${id}/permanent`);
    return response.data;
  },

  changeUserRole: async (id, role) => {
    const response = await axiosInstance.put(`/api/admin/users/${id}/role`, { role });
    return response.data;
  },

  changeUserPassword: async (id, newPassword) => {
    const response = await axiosInstance.put(`/api/admin/users/${id}/password`, { newPassword });
    return response.data;
  },

  toggleUserStatus: async (id) => {
    const response = await axiosInstance.put(`/api/admin/users/${id}/toggle-status`);
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await axiosInstance.get('/api/admin/users/search', { 
      params: { q: query } 
    });
    return response.data;
  },

  getUsersByRole: async (role, page = 0, size = 20) => {
    const response = await axiosInstance.get(`/api/admin/users/role/${role}`, {
      params: { page, size }
    });
    return response.data;
  },

  getActiveUsersByRole: async (role) => {
    const response = await axiosInstance.get(`/api/admin/users/role/${role}/active`);
    return response.data;
  },

  getUserStatistics: async () => {
    const response = await axiosInstance.get('/api/admin/users/statistics');
    return response.data;
  },

  bulkUpdateStatus: async (userIds, active) => {
    const response = await axiosInstance.put('/api/admin/users/bulk/status', {
      userIds,
      active
    });
    return response.data;
  },

  getAllRoles: async () => {
    const response = await axiosInstance.get('/api/admin/users/roles');
    return response.data;
  },

  // Class Management APIs
  createClass: async (classData) => {
    const response = await axiosInstance.post('/admin/classes', classData);
    return response.data;
  },

  getMyClasses: async () => {
    const response = await axiosInstance.get('/admin/classes');
    return response.data;
  },

  // For ADMIN to get all classes (NEW API)
  getAllClassesAll: async () => {
    const response = await axiosInstance.get('/admin/classes/all');
    return response.data;
  },

  // For ADMIN to get all classes with details (NEW API)
  getAllClassesWithDetails: async () => {
    const response = await axiosInstance.get('/admin/classes/all/details');
    return response.data;
  },

  // For ADMIN to get all classes as DTO (NEW API)
  getAllClassesAsDTO: async () => {
    const response = await axiosInstance.get('/admin/classes/all/dto');
    return response.data;
  },

  // Test all endpoints
  testAllClassEndpoints: async () => {
    const results = {};
    
    try {
      console.log('🧪 Testing /admin/classes...');
      results.myClasses = await axiosInstance.get('/admin/classes');
    } catch (err) {
      results.myClasses = { error: err.response?.status + ' - ' + err.message };
    }

    try {
      console.log('🧪 Testing /admin/classes/all...');
      results.allClasses = await axiosInstance.get('/admin/classes/all');
    } catch (err) {
      results.allClasses = { error: err.response?.status + ' - ' + err.message };
    }

    try {
      console.log('🧪 Testing /admin/classes/all/details...');
      results.allClassesDetails = await axiosInstance.get('/admin/classes/all/details');
    } catch (err) {
      results.allClassesDetails = { error: err.response?.status + ' - ' + err.message };
    }

    try {
      console.log('🧪 Testing /admin/classes/all/dto...');
      results.allClassesDTO = await axiosInstance.get('/admin/classes/all/dto');
    } catch (err) {
      results.allClassesDTO = { error: err.response?.status + ' - ' + err.message };
    }

    return results;
  },

  getAllClasses: async (params = {}) => {
    const response = await axiosInstance.get('/admin/classes', { params });
    return response.data;
  },

  getClassById: async (id) => {
    const response = await axiosInstance.get(`/admin/classes/${id}`);
    return response.data;
  },

  updateClass: async (id, classData) => {
    const response = await axiosInstance.put(`/admin/classes/${id}`, classData);
    return response.data;
  },

  deleteClass: async (id) => {
    const response = await axiosInstance.delete(`/admin/classes/${id}`);
    return response.data;
  },

  addStudentToClass: async (classId, email) => {
    const response = await axiosInstance.post(`/admin/classes/${classId}/students`, { email });
    return response.data;
  },

  removeStudentFromClass: async (classId, email) => {
    const response = await axiosInstance.delete(`/admin/classes/${classId}/students`, {
      params: { email }
    });
    return response.data;
  },

  getClassByCode: async (code) => {
    const response = await axiosInstance.get(`/admin/classes/code/${code}`);
    return response.data;
  },

  // Staff Management
  createStaff: async (staffData) => {
    const response = await axiosInstance.post('/admin/staff', staffData);
    return response.data;
  },

  // Project Management APIs
  createProject: async (projectData) => {
    const response = await axiosInstance.post('/api/projects', projectData);
    return response.data;
  },

  getMyProjects: async () => {
    const response = await axiosInstance.get('/api/projects/my');
    return response.data;
  },

  getAllProjects: async () => {
    const response = await axiosInstance.get('/api/projects/approved');
    return response.data;
  },

  // Get all projects including pending ones
  getAllProjectsIncludingPending: async () => {
    try {
      // Try approved projects first
      const approvedResponse = await axiosInstance.get('/api/projects/approved');
      const pendingResponse = await axiosInstance.get('/api/projects/pending');
      
      const approved = approvedResponse.data?.data || [];
      const pending = pendingResponse.data?.data || [];
      
      return {
        status: 'success',
        data: [...approved, ...pending]
      };
    } catch {
      // Fallback: return empty array
      return {
        status: 'success',
        data: []
      };
    }
  },

  getPendingProjects: async () => {
    const response = await axiosInstance.get('/api/projects/pending');
    return response.data;
  },

  getProjectById: async (id) => {
    const response = await axiosInstance.get(`/api/projects/${id}`);
    return response.data;
  },

  getProjectsByClassroom: async (classroomId) => {
    const response = await axiosInstance.get(`/api/projects/classroom/${classroomId}`);
    return response.data;
  },

  approveProject: async (id, comment = '') => {
    const response = await axiosInstance.put(`/api/projects/${id}/approve`, null, {
      params: { comment }
    });
    return response.data;
  },

  rejectProject: async (id, reason = '') => {
    const response = await axiosInstance.put(`/api/projects/${id}/reject`, null, {
      params: { reason }
    });
    return response.data;
  },

  submitProject: async (id) => {
    const response = await axiosInstance.put(`/api/projects/${id}/submit`);
    return response.data;
  },

  // Project Milestones
  getProjectMilestones: async (projectId) => {
    const response = await axiosInstance.get(`/api/projects/${projectId}/milestones`);
    return response.data;
  },

  createMilestone: async (projectId, milestoneData) => {
    const response = await axiosInstance.post(`/api/projects/${projectId}/milestones`, milestoneData);
    return response.data;
  },

  // Team Management APIs - Following exact backend specification

  // API 5.1: Auto generate teams
  autoGenerateTeams: async (teamData) => {
    const response = await axiosInstance.post('/api/teams/auto-generate', teamData);
    return response.data;
  },

  // API 5.2: Get teams by project
  getTeamsByProject: async (projectId) => {
    const response = await axiosInstance.get(`/api/teams/project/${projectId}`);
    return response.data;
  },

  // API 5.3: Get my teams
  getMyTeams: async () => {
    const response = await axiosInstance.get('/api/teams/my');
    return response.data;
  },

  // API 5.4: Get team by ID
  getTeamById: async (teamId) => {
    console.log('🚀 API Call: getTeamById', { teamId });
    try {
      const response = await axiosInstance.get(`/api/teams/${teamId}`);
      console.log('✅ getTeamById response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ getTeamById error:', error);
      throw error;
    }
  },

  // API 5.5: Add member to team
  addMemberToTeam: async (teamId, userId) => {
    const response = await axiosInstance.post(`/api/teams/${teamId}/members/${userId}`);
    return response.data;
  },

  // API 5.6: Remove member from team
  removeMemberFromTeam: async (teamId, userId) => {
    const response = await axiosInstance.delete(`/api/teams/${teamId}/members/${userId}`);
    return response.data;
  },

  // API 5.7: Delete all teams of project
  deleteTeamsByProject: async (projectId) => {
    const response = await axiosInstance.delete(`/api/teams/project/${projectId}`);
    return response.data;
  },
};