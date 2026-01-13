import axiosInstance from '../config/axios';

export const authService = {
  // Đăng nhập
  login: async (credentials) => {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    return response.data;
  },

  // Đăng ký
  register: async (userData) => {
    const response = await axiosInstance.post('/api/auth/register', userData);
    return response.data;
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/api/auth/me');
    return response.data;
  },

  // Test connection
  testConnection: async () => {
    const response = await axiosInstance.get('/api/health');
    return response.data;
  }
};