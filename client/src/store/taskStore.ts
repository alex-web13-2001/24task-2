import { create } from 'zustand';
import { tasksAPI } from '../api/tasks';

interface TaskState {
  tasks: any[];
  currentTask: any | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: (params?: any) => Promise<void>;
  fetchTaskById: (id: string) => Promise<void>;
  createTask: (data: any) => Promise<any>;
  updateTask: (id: string, data: any) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearCurrentTask: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,

  fetchTasks: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksAPI.getAll(params);
      set({ tasks: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ошибка загрузки задач', 
        isLoading: false 
      });
    }
  },

  fetchTaskById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksAPI.getById(id);
      set({ currentTask: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ошибка загрузки задачи', 
        isLoading: false 
      });
    }
  },

  createTask: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksAPI.create(data);
      set((state) => ({ 
        tasks: [response.data, ...state.tasks], 
        isLoading: false 
      }));
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ошибка создания задачи', 
        isLoading: false 
      });
      throw error;
    }
  },

  updateTask: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksAPI.update(id, data);
      set((state) => ({
        tasks: state.tasks.map(t => t._id === id ? response.data : t),
        currentTask: state.currentTask?._id === id ? response.data : state.currentTask,
        isLoading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ошибка обновления задачи', 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      await tasksAPI.delete(id);
      set((state) => ({
        tasks: state.tasks.filter(t => t._id !== id)
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Ошибка удаления задачи' });
      throw error;
    }
  },

  clearCurrentTask: () => set({ currentTask: null })
}));
