import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('employee');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/employees/login', { email, password }),
};

export const employeesAPI = {
  getAll: () => api.get('/employees'),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  resetPassword: (id, password) => api.post(`/employees/${id}/reset-password`, { password }),
};

export const menuAPI = {
  getCategories: () => api.get('/menu/categories'),
  createCategory: (data) => api.post('/menu/categories', data),
  updateCategory: (id, data) => api.put(`/menu/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/menu/categories/${id}`),
  getItems: () => api.get('/menu/items'),
  getItem: (id) => api.get(`/menu/items/${id}`),
  createItem: (data) => api.post('/menu/items', data),
  updateItem: (id, data) => api.put(`/menu/items/${id}`, data),
  deleteItem: (id) => api.delete(`/menu/items/${id}`),
};

export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getLowStock: () => api.get('/inventory/low'),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  adjust: (id, data) => api.post(`/inventory/${id}/adjust`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
};

export const tablesAPI = {
  getAll: () => api.get('/tables'),
  getAvailable: () => api.get('/tables/available'),
  create: (data) => api.post('/tables', data),
  update: (id, data) => api.put(`/tables/${id}`, data),
  updateStatus: (id, status) => api.put(`/tables/${id}/status`, { status }),
  delete: (id) => api.delete(`/tables/${id}`),
  startSession: (id) => api.post(`/tables/${id}/start-session`),
  endSession: (id) => api.post(`/tables/${id}/end-session`),
};

export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  processPayment: (id, method) => api.put(`/orders/${id}/payment`, { payment_method: method }),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const reportsAPI = {
  getDaily: (date) => api.get('/reports/daily', { params: { date } }),
  getWeekly: () => api.get('/reports/weekly'),
  getMonthly: () => api.get('/reports/monthly'),
  getEmployeeSales: () => api.get('/reports/employee'),
  getNetProfit: (from, to) => api.get('/reports/net-profit', { params: { from, to } }),
};

export default api;
