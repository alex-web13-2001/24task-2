import apiClient from './client';

export const tasksAPI = {
  // Получение всех задач
  getAll: async (params?: any) => {
    const response = await apiClient.get('/tasks', { params });
    return response.data;
  },

  // Получение задачи по ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },

  // Создание задачи
  create: async (data: any) => {
    const response = await apiClient.post('/tasks', data);
    return response.data;
  },

  // Обновление задачи
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/tasks/${id}`, data);
    return response.data;
  },

  // Удаление задачи
  delete: async (id: string) => {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },

  // Получение истории задачи
  getHistory: async (id: string) => {
    const response = await apiClient.get(`/tasks/${id}/history`);
    return response.data;
  }
};

export const categoriesAPI = {
  // Получение всех категорий
  getAll: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  // Получение категории по ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  // Создание категории
  create: async (data: any) => {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  // Обновление категории
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  },

  // Удаление категории
  delete: async (id: string) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  }
};

export const invitationsAPI = {
  // Получение информации о приглашении
  getInfo: async (token: string) => {
    const response = await apiClient.get(`/invitations/info/${token}`);
    return response.data;
  },

  // Принятие приглашения
  accept: async (token: string) => {
    const response = await apiClient.post('/invitations/accept', { token });
    return response.data;
  },

  // Отмена приглашения
  revoke: async (id: string) => {
    const response = await apiClient.post(`/invitations/${id}/revoke`);
    return response.data;
  },

  // Получение приглашений проекта
  getProjectInvitations: async (projectId: string) => {
    const response = await apiClient.get(`/invitations/project/${projectId}`);
    return response.data;
  }
};

export const userAPI = {
  // Получение профиля
  getProfile: async () => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  // Обновление профиля
  updateProfile: async (data: any) => {
    const response = await apiClient.put('/user/profile', data);
    return response.data;
  },

  // Смена пароля
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.post('/user/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Обновление настроек
  updateSettings: async (data: any) => {
    const response = await apiClient.put('/user/settings', data);
    return response.data;
  },

  // Удаление аккаунта
  deleteAccount: async () => {
    const response = await apiClient.delete('/user/account');
    return response.data;
  }
};
