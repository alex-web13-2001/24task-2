import apiClient from './client';

export const projectsAPI = {
  // Получение всех проектов
  getAll: async (params?: any) => {
    const response = await apiClient.get('/projects', { params });
    return response.data;
  },

  // Получение проекта по ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  // Создание проекта
  create: async (data: any) => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  // Обновление проекта
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
  },

  // Архивирование проекта
  archive: async (id: string) => {
    const response = await apiClient.post(`/projects/${id}/archive`);
    return response.data;
  },

  // Восстановление проекта
  restore: async (id: string) => {
    const response = await apiClient.post(`/projects/${id}/restore`);
    return response.data;
  },

  // Удаление проекта
  delete: async (id: string) => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },

  // Обновление колонок
  updateColumns: async (id: string, columns: any[]) => {
    const response = await apiClient.put(`/projects/${id}/columns`, { columns });
    return response.data;
  },

  // Приглашение пользователя
  inviteUser: async (id: string, email: string, role: string) => {
    const response = await apiClient.post(`/projects/${id}/invite`, { email, role });
    return response.data;
  },

  // Удаление участника
  removeMember: async (id: string, memberId: string) => {
    const response = await apiClient.delete(`/projects/${id}/members/${memberId}`);
    return response.data;
  },

  // Изменение роли участника
  updateMemberRole: async (id: string, memberId: string, role: string) => {
    const response = await apiClient.put(`/projects/${id}/members/${memberId}/role`, { role });
    return response.data;
  }
};
