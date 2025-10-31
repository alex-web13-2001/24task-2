import { create } from 'zustand';
import { projectsAPI } from '../api/projects';

interface ProjectState {
  projects: any[];
  currentProject: any | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProjects: (params?: any) => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  createProject: (data: any) => Promise<any>;
  updateProject: (id: string, data: any) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  restoreProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  clearCurrentProject: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsAPI.getAll(params);
      set({ projects: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ошибка загрузки проектов', 
        isLoading: false 
      });
    }
  },

  fetchProjectById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsAPI.getById(id);
      set({ currentProject: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ошибка загрузки проекта', 
        isLoading: false 
      });
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsAPI.create(data);
      set((state) => ({ 
        projects: [response.data, ...state.projects], 
        isLoading: false 
      }));
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ошибка создания проекта', 
        isLoading: false 
      });
      throw error;
    }
  },

  updateProject: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsAPI.update(id, data);
      set((state) => ({
        projects: state.projects.map(p => p._id === id ? response.data : p),
        currentProject: state.currentProject?._id === id ? response.data : state.currentProject,
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ошибка обновления проекта', 
        isLoading: false 
      });
      throw error;
    }
  },

  archiveProject: async (id) => {
    try {
      await projectsAPI.archive(id);
      set((state) => ({
        projects: state.projects.map(p => 
          p._id === id ? { ...p, status: 'archived' } : p
        )
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка архивирования проекта' });
      throw error;
    }
  },

  restoreProject: async (id) => {
    try {
      await projectsAPI.restore(id);
      set((state) => ({
        projects: state.projects.map(p => 
          p._id === id ? { ...p, status: 'active' } : p
        )
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка восстановления проекта' });
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      await projectsAPI.delete(id);
      set((state) => ({
        projects: state.projects.filter(p => p._id !== id)
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка удаления проекта' });
      throw error;
    }
  },

  clearCurrentProject: () => set({ currentProject: null })
}));
