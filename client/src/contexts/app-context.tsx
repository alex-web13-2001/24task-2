import React from 'react';
import { tasksAPI, projectsAPI, authAPI } from '../utils/api/client';
import { toast } from 'sonner@2.0.3';

export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  deadline?: string;
  projectId?: string;
  categoryId?: string;
  assigneeId?: string;
  userId?: string; // Создатель задачи
  tags?: string[];
  attachments?: TaskAttachment[];
  completed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectLink {
  id: string;
  name: string;
  url: string;
}

export interface ProjectAttachment {
  id: string;
  name: string;
  size: string;
  url: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  category?: string;
  status?: string;
  userId?: string; // Владелец проекта
  members?: any[];
  links?: ProjectLink[];
  attachments?: ProjectAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt?: string;
}

export type UserRole = 'owner' | 'admin' | 'collaborator' | 'member' | 'viewer' | null;

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface CustomColumn {
  id: string;
  title: string;
  color: string;
}

interface AppContextType {
  tasks: Task[];
  projects: Project[];
  currentUser: User | null;
  teamMembers: TeamMember[];
  customColumns: CustomColumn[];
  isLoading: boolean;
  isRealtimeConnected: boolean;
  fetchTasks: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  fetchTeamMembers: () => Promise<void>;
  fetchCustomColumns: () => Promise<void>;
  saveCustomColumns: (columns: CustomColumn[]) => Promise<void>;
  updateCurrentUser: (updates: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  deleteAvatar: () => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>, options?: { silent?: boolean }) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  uploadTaskAttachment: (taskId: string, file: File) => Promise<TaskAttachment>;
  deleteTaskAttachment: (taskId: string, attachmentId: string) => Promise<void>;
  createProject: (projectData: Partial<Project>) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  // Permission helpers
  getUserRoleInProject: (projectId: string) => UserRole;
  canViewAllProjectTasks: (projectId: string) => boolean;
  canEditTask: (task: Task) => boolean;
  canCreateTask: (projectId?: string) => boolean;
  canEditProject: (projectId: string) => boolean;
  canDeleteProject: (projectId: string) => boolean;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [customColumns, setCustomColumns] = React.useState<CustomColumn[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = React.useState(false);

  const fetchTasks = React.useCallback(async () => {
    try {
      // Check if user is authenticated first
      const token = await getAuthToken();
      if (!token) {
        // User is not logged in - this is expected, just return
        return;
      }
      
      const fetchedTasks = await tasksAPI.getAll();
      console.log('✅ Задачи загружены из базы:', fetchedTasks.length);
      
      // Log task distribution by projectId
      const personalTasks = fetchedTasks.filter(t => !t.projectId);
      const projectTasks = fetchedTasks.filter(t => t.projectId);
      const tasksByProject = projectTasks.reduce((acc: any, task) => {
        acc[task.projectId] = (acc[task.projectId] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Распределение задач:', {
        личные: personalTasks.length,
        проектные: projectTasks.length,
        поПроектам: tasksByProject,
      });
      
      // Log all tasks with assignee info for debugging member access
      if (projectTasks.length > 0) {
        console.log('📋 Все проектные задачи с исполнителями:', projectTasks.map(t => ({
          id: t.id,
          title: t.title,
          projectId: t.projectId,
          assigneeId: t.assigneeId,
          status: t.status,
        })));
      }
      
      // Log first few tasks for debugging
      if (fetchedTasks.length > 0) {
        console.log('📋 Первые 3 задачи:', fetchedTasks.slice(0, 3).map(t => ({
          id: t.id,
          title: t.title,
          projectId: t.projectId,
          status: t.status,
        })));
      }
      
      // Limit tasks to prevent memory issues
      const limitedTasks = fetchedTasks.slice(0, 1000);
      if (fetchedTasks.length > 1000) {
        console.warn(`⚠️ Показано ${limitedTasks.length} из ${fetchedTasks.length} задач для оптимизации производительности`);
      }
      
      setTasks(limitedTasks);
    } catch (error: any) {
      // Only log if it's not an auth error (auth errors are expected when not logged in)
      if (!error.message?.includes('авторизован') && !error.message?.includes('Not authenticated')) {
        console.error('❌ Ошибка загрузки задач:', error);
        toast.error('Ошибка загрузки задач');
      }
    }
  }, []);

  const fetchProjects = React.useCallback(async () => {
    try {
      // Check if user is authenticated first
      const token = await getAuthToken();
      if (!token) {
        // User is not logged in - this is expected, just return
        return;
      }
      
      const fetchedProjects = await projectsAPI.getAll();
      console.log('✅ Проекты загружены из базы:', fetchedProjects.length);
      
      // Limit projects to prevent memory issues
      const limitedProjects = fetchedProjects.slice(0, 500);
      if (fetchedProjects.length > 500) {
        console.warn(`⚠️ Показано ${limitedProjects.length} из ${fetchedProjects.length} проектов для оптимизации производительности`);
      }
      
      setProjects(limitedProjects);
    } catch (error: any) {
      // Only log if it's not an auth error (auth errors are expected when not logged in)
      if (!error.message?.includes('авторизован') && !error.message?.includes('Not authenticated')) {
        console.error('❌ Ошибка загрузки проектов:', error);
        toast.error('Ошибка загрузки проектов');
      }
    }
  }, []);

  const fetchCurrentUser = React.useCallback(async () => {
    try {
      // Check if user is authenticated first
      const token = await getAuthToken();
      if (!token) {
        // User is not logged in - this is expected, just return
        return;
      }
      
      const user = await authAPI.getCurrentUser();
      if (user) {
        const userData = {
          id: user.id,
          email: user.email,
          name: user.name || user.user_metadata?.name || 'Пользователь',
          avatarUrl: user.avatarUrl || user.user_metadata?.avatarUrl,
          createdAt: user.createdAt || user.created_at,
        };
        setCurrentUser(userData);
        console.log('✅ Данные пользователя загружены:', {
          id: userData.id,
          email: userData.email,
          name: userData.name,
        });
      }
    } catch (error: any) {
      console.error('❌ Ошибка загрузки данных пользователя:', error);
    }
  }, []);

  const fetchTeamMembers = React.useCallback(async () => {
    try {
      // Check if user is authenticated first
      const token = await getAuthToken();
      if (!token) {
        // User is not logged in - this is expected, just return
        return;
      }
      
      const members = await teamAPI.getMembers();
      console.log('✅ Участники команды загружены:', members.length);
      
      // Deduplicate members by id to prevent display issues
      const uniqueMembersMap = new Map();
      members.forEach((member: TeamMember) => {
        if (!uniqueMembersMap.has(member.id)) {
          uniqueMembersMap.set(member.id, member);
        }
      });
      const uniqueMembers = Array.from(uniqueMembersMap.values());
      
      if (uniqueMembers.length !== members.length) {
        console.warn(`⚠️ Дубликаты участников удалены: ${members.length} -> ${uniqueMembers.length}`);
      }
      
      setTeamMembers(uniqueMembers);
    } catch (error: any) {
      console.error('❌ Ошибка загрузки участников команды:', error);
      // Don't show error toast - team members are optional
    }
  }, []);

  const fetchCustomColumns = React.useCallback(async () => {
    try {
      // Check if user is authenticated first
      const token = await getAuthToken();
      if (!token) {
        // User is not logged in - this is expected, just return
        return;
      }
      
      const columns = await userSettingsAPI.getCustomColumns();
      console.log('✅ Кастомные столбцы загружены из API:', {
        count: columns.length,
        columns,
      });
      setCustomColumns(columns);
    } catch (error: any) {
      console.error('❌ Ошибка загрузки кастомных столбцов из API:', error);
      // Don't show error toast - custom columns are optional, will use localStorage fallback
      // Try to load from localStorage as fallback
      if (currentUser) {
        const stored = localStorage.getItem(`personal-custom-columns-${currentUser.id}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setCustomColumns(parsed);
            console.log('✅ Кастомные столбцы загружены из localStorage (fallback):', {
              count: parsed.length,
              columns: parsed,
            });
          } catch (e) {
            console.error('❌ Ошибка парсинга кастомных столбцов из localStorage:', e);
          }
        } else {
          console.log('ℹ️ Кастомные столбцы не найдены ни в API, ни в localStorage');
        }
      }
    }
  }, [currentUser]);

  const saveCustomColumns = React.useCallback(async (columns: CustomColumn[]) => {
    try {
      await userSettingsAPI.saveCustomColumns(columns);
      setCustomColumns(columns);
      console.log('✅ Кастомные столбцы сохранены в API:', {
        count: columns.length,
        columns,
      });
      
      // Also save to localStorage as backup
      if (currentUser) {
        localStorage.setItem(`personal-custom-columns-${currentUser.id}`, JSON.stringify(columns));
        console.log('✅ Кастомные столбцы также сохранены в localStorage (backup)');
      }
    } catch (error: any) {
      console.error('❌ Ошибка сохранения кастомных столбцов в API:', error);
      // Save to localStorage as fallback
      if (currentUser) {
        localStorage.setItem(`personal-custom-columns-${currentUser.id}`, JSON.stringify(columns));
        setCustomColumns(columns);
        console.log('✅ Кастомные столбцы сохранены в localStorage (fallback):', {
          count: columns.length,
          columns,
        });
      }
    }
  }, [currentUser]);

  const updateCurrentUser = React.useCallback(async (updates: Partial<User>) => {
    try {
      const updatedUser = await authAPI.updateProfile(updates);
      setCurrentUser((prev) => prev ? { ...prev, ...updates } : null);
      toast.success('Профиль обновлен');
      return updatedUser;
    } catch (error: any) {
      console.error('❌ Ошибка обновления профиля:', error);
      toast.error('Ошибка обновления профиля');
      throw error;
    }
  }, []);

  const uploadAvatar = React.useCallback(async (file: File) => {
    try {
      const avatarUrl = await authAPI.uploadAvatar(file);
      setCurrentUser((prev) => prev ? { ...prev, avatarUrl } : null);
      toast.success('Аватар загружен');
    } catch (error: any) {
      console.error('❌ Ошибка загрузки аватара:', error);
      toast.error(error.message || 'Ошибка загрузки аватара');
      throw error;
    }
  }, []);

  const deleteAvatar = React.useCallback(async () => {
    try {
      await authAPI.deleteAvatar();
      setCurrentUser((prev) => prev ? { ...prev, avatarUrl: undefined } : null);
      toast.success('Аватар удален');
    } catch (error: any) {
      console.error('❌ Ошибка удаления аватара:', error);
      toast.error('Ошибка удаления аватара');
      throw error;
    }
  }, []);

  // Load data on mount - ONLY ONCE!
  React.useEffect(() => {
    let isMounted = true;
    let loadingTimeout: NodeJS.Timeout | null = null;
    
    const loadData = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      
      // Set a timeout to prevent infinite loading
      loadingTimeout = setTimeout(() => {
        if (isMounted) {
          console.warn('⚠️ Data loading timeout exceeded');
          setIsLoading(false);
        }
      }, 30000); // 30 seconds timeout
      
      try {
        console.log('📊 Starting data load...');
        
        // First load user and team
        await Promise.all([
          fetchCurrentUser(),
          fetchTeamMembers(),
        ]);
        console.log('✅ User and team loaded');
        
        // Then load tasks, projects and custom columns
        await Promise.all([
          fetchTasks(),
          fetchProjects(),
          fetchCustomColumns(),
        ]);
        console.log('✅ All data loaded successfully');
      } catch (error: any) {
        console.error('❌ Error loading initial data:', error);
        
        // If authentication error, show message
        if (error.message && error.message.includes('авторизован')) {
          toast.error('Ошибка аутентификации. Пожалуйста, войдите снова.');
        }
      } finally {
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
        }
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, []); // Empty deps - run only once on mount

  // Load custom columns when user is loaded
  React.useEffect(() => {
    if (currentUser) {
      console.log('👤 User loaded, fetching custom columns...');
      fetchCustomColumns();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]); // Only re-run when user ID changes

  // Real-time subscriptions for tasks and projects
  React.useEffect(() => {
    // Только если пользователь авторизован
    if (!currentUser) {
      console.log('⏸️ Polling не запущен - пользователь не авторизован');
      return;
    }
    
    console.log('🔴 Подключение polling для синхронизации...');
    
    // Use polling instead of realtime for KV store compatibility
    const intervalId = setInterval(async () => {
      try {
        // Обновляем данные каждые 3 секунды используя существующие API функции
        await Promise.all([
          fetchTasks(),
          fetchProjects(),
          fetchCustomColumns(), // Также обновляем кастомные колонки
        ]);

        // Если успешно получили данные, считаем что подключение активно
        setIsRealtimeConnected(true);
      } catch (error) {
        console.error('Polling error:', error);
        setIsRealtimeConnected(false);
      }
    }, 3000); // Обновление каждые 3 секунды

    console.log('✅ Polling включен (обновление каждые 3 секунды)');
    setIsRealtimeConnected(true);

    // Cleanup polling on unmount
    return () => {
      console.log('🔴 Отключение polling...');
      clearInterval(intervalId);
      setIsRealtimeConnected(false);
    };
  }, [currentUser, fetchTasks, fetchProjects, fetchCustomColumns]); // Re-subscribe when user or fetch functions change

  // RefreshData function for manual refresh
  const refreshData = React.useCallback(async () => {
    console.log('🔄 Refreshing all data...');
    setIsLoading(true);
    try {
      await Promise.all([
        fetchTasks(), 
        fetchProjects(), 
        fetchCurrentUser(),
        fetchTeamMembers(),
        fetchCustomColumns(),
      ]);
      console.log('✅ Data refresh complete');
    } finally {
      setIsLoading(false);
    }
  }, [fetchTasks, fetchProjects, fetchCurrentUser, fetchTeamMembers, fetchCustomColumns]);

  // Show welcome message for new users
  React.useEffect(() => {
    if (projects.length > 0 && tasks.length > 0 && !isLoading) {
      const isFirstLoad = sessionStorage.getItem('welcomeShown') !== 'true';
      
      if (isFirstLoad) {
        sessionStorage.setItem('welcomeShown', 'true');
        const timeoutId = setTimeout(() => {
          toast.success('Добро пожаловать! Мы создали для вас демонстрационные проекты и задачи 📋', {
            duration: 5000,
          });
        }, 1500);
        
        // Cleanup timeout on unmount
        return () => clearTimeout(timeoutId);
      }
    }
  }, [projects.length, tasks.length, isLoading]);

  const createTask = async (taskData: Partial<Task>): Promise<Task> => {
    try {
      const newTask = await tasksAPI.create(taskData);
      // Добавляем новую задачу в локальное состояние сразу
      setTasks((prev) => [...prev, newTask]);
      toast.success('Задача создана');
      return newTask;
    } catch (error: any) {
      console.error('Create task error:', error);
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('авторизован')) {
        toast.error('Сессия истекла. Пожалуйста, войдите снова.', { duration: 5000 });
        // Trigger logout
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(error.message || 'Ошибка создания задачи');
      }
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>, options?: { silent?: boolean }): Promise<Task> => {
    // Сохраняем оригинальную задачу для возможного отката
    let originalTask: Task | undefined;
    
    // Оптимистичное обновление UI - обновляем сразу для мгновенного отклика
    setTasks((prev) => {
      const task = prev.find(t => t.id === taskId);
      if (!task) return prev;
      
      originalTask = task;
      const updatedTaskOptimistic = { ...task, ...updates, updatedAt: new Date().toISOString() };
      return prev.map((t) => (t.id === taskId ? updatedTaskOptimistic : t));
    });
    
    try {
      const updatedTask = await tasksAPI.update(taskId, updates);
      // Обновляем с реальными данными сервера
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      
      // Показываем toast только если это не silent update (например, при перемещении карточки)
      if (!options?.silent) {
        toast.success('Задача обновлена');
      }
      return updatedTask;
    } catch (error: any) {
      console.error('Update task error:', error);
      
      // Откатываем оптимистичное обновление в случае ошибки
      if (originalTask) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? originalTask : t)));
      }
      
      // Check if it's an authentication error
      if (error.message && error.message.includes('авторизован')) {
        toast.error('Сессия истекла. Пожалуйста, войдите снова.', { duration: 5000 });
        // Trigger logout
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(error.message || 'Ошибка обновления задачи');
      }
      throw error;
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    // Сохраняем задачу на случай отката
    let deletedTask: Task | undefined;
    
    // Оптимистично удаляем из UI
    setTasks((prev) => {
      deletedTask = prev.find(t => t.id === taskId);
      return prev.filter((t) => t.id !== taskId);
    });
    
    try {
      await tasksAPI.delete(taskId);
      toast.success('Задача удалена');
    } catch (error: any) {
      console.error('Delete task error:', error);
      
      // Откатываем удаление в случае ошибки
      if (deletedTask) {
        setTasks((prev) => [...prev, deletedTask]);
      }
      
      toast.error(error.message || 'Ошибка удаления задачи');
      throw error;
    }
  };

  const createProject = async (projectData: Partial<Project>): Promise<Project> => {
    try {
      const newProject = await projectsAPI.create(projectData);
      // Добавляем проект сразу в локальное состояние
      setProjects((prev) => [...prev, newProject]);
      toast.success('Проект создан');
      return newProject;
    } catch (error: any) {
      console.error('Create project error:', error);
      toast.error(error.message || 'Ошибка создания проекта');
      throw error;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>): Promise<Project> => {
    // Сохраняем оригинальный проект для возможного отката
    let originalProject: Project | undefined;
    
    // Оптимистичное обновление
    setProjects((prev) => {
      const project = prev.find(p => p.id === projectId);
      if (!project) return prev;
      
      originalProject = project;
      const updatedProjectOptimistic = { ...project, ...updates };
      return prev.map((p) => (p.id === projectId ? updatedProjectOptimistic : p));
    });
    
    try {
      const updatedProject = await projectsAPI.update(projectId, updates);
      // Обновляем реальными данными с сервера
      setProjects((prev) => prev.map((p) => (p.id === projectId ? updatedProject : p)));
      toast.success('Проект обновлен');
      return updatedProject;
    } catch (error: any) {
      console.error('Update project error:', error);
      
      // Откатываем оптимистичное обновление
      if (originalProject) {
        setProjects((prev) => prev.map((p) => (p.id === projectId ? originalProject : p)));
      }
      
      toast.error(error.message || 'Ошибка обновления проекта');
      throw error;
    }
  };

  const deleteProject = async (projectId: string): Promise<void> => {
    // Сохраняем данные для отката
    let deletedProject: Project | undefined;
    let deletedTasks: Task[] = [];
    
    // Оптимистично удаляем проект и его задачи
    setProjects((prev) => {
      deletedProject = prev.find(p => p.id === projectId);
      return prev.filter((p) => p.id !== projectId);
    });
    
    setTasks((prev) => {
      deletedTasks = prev.filter(t => t.projectId === projectId);
      return prev.filter((t) => t.projectId !== projectId);
    });
    
    try {
      await projectsAPI.delete(projectId);
      toast.success('Проект удален');
    } catch (error: any) {
      console.error('Delete project error:', error);
      
      // Откатываем удаление
      if (deletedProject) {
        setProjects((prev) => [...prev, deletedProject]);
      }
      if (deletedTasks.length > 0) {
        setTasks((prev) => [...prev, ...deletedTasks]);
      }
      
      toast.error(error.message || 'Ошибка удаления проекта');
      throw error;
    }
  };

  const uploadTaskAttachment = async (taskId: string, file: File): Promise<TaskAttachment> => {
    try {
      console.log(`📎 uploadTaskAttachment: Starting upload for task ${taskId}, file: ${file.name}`);
      const attachment = await tasksAPI.uploadAttachment(taskId, file);
      console.log(`✅ uploadTaskAttachment: Upload successful, attachment ID: ${attachment.id}`);
      
      // Update task in state
      setTasks((prev) => prev.map((t) => {
        if (t.id === taskId) {
          console.log(`📝 uploadTaskAttachment: Updating task ${taskId} in state`);
          return {
            ...t,
            attachments: [...(t.attachments || []), attachment],
          };
        }
        return t;
      }));
      
      return attachment;
    } catch (error: any) {
      console.error(`❌ uploadTaskAttachment: Error uploading file ${file.name} for task ${taskId}:`, error);
      throw error;
    }
  };

  const deleteTaskAttachment = async (taskId: string, attachmentId: string): Promise<void> => {
    try {
      await tasksAPI.deleteAttachment(taskId, attachmentId);
      
      // Update task in state
      setTasks((prev) => prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            attachments: (t.attachments || []).filter((a) => a.id !== attachmentId),
          };
        }
        return t;
      }));
      
      toast.success('Файл удален');
    } catch (error: any) {
      console.error('Delete attachment error:', error);
      toast.error(error.message || 'Ошибка удаления файла');
      throw error;
    }
  };

  // ========== PERMISSION HELPERS ==========

  /**
   * Get user's role in a project
   */
  const getUserRoleInProject = React.useCallback((projectId: string): UserRole => {
    if (!currentUser) return null;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    
    // Check if user is project owner
    if (project.userId === currentUser.id) {
      return 'owner';
    }
    
    // Check members list
    if (project.members && Array.isArray(project.members)) {
      const member = project.members.find((m: any) => 
        m.userId === currentUser.id || m.email === currentUser.email
      );
      
      if (member) {
        return member.role || 'member'; // Default to 'member' if role not specified
      }
    }
    
    return null;
  }, [currentUser, projects]);

  /**
   * Check if user can view all tasks in project
   * Owner, Admin/Collaborator, Viewer - can view all tasks
   * Member - can only view assigned tasks
   */
  const canViewAllProjectTasks = React.useCallback((projectId: string): boolean => {
    const role = getUserRoleInProject(projectId);
    return role === 'owner' || role === 'collaborator' || role === 'viewer';
  }, [getUserRoleInProject]);

  /**
   * Check if user can edit task
   * Owner, Admin/Collaborator - can edit any task
   * Member - can only edit assigned tasks
   * Viewer - cannot edit
   */
  const canEditTask = React.useCallback((task: Task): boolean => {
    if (!currentUser) return false;
    
    // Personal tasks can always be edited by owner
    if (!task.projectId) {
      return task.userId === currentUser.id;
    }
    
    const role = getUserRoleInProject(task.projectId);
    
    if (role === 'owner' || role === 'collaborator') {
      return true;
    }
    
    if (role === 'member') {
      // Member can edit task if they are assigned to it OR created it
      return task.assigneeId === currentUser.id || task.createdBy === currentUser.id;
    }
    
    return false; // Viewer cannot edit
  }, [currentUser, getUserRoleInProject]);

  /**
   * Check if user can create task in project
   * Owner, Admin/Collaborator, Member - can create tasks
   * Viewer - cannot create
   */
  const canCreateTask = React.useCallback((projectId?: string): boolean => {
    if (!currentUser) return false;
    
    // Personal tasks can always be created
    if (!projectId) return true;
    
    const role = getUserRoleInProject(projectId);
    return role === 'owner' || role === 'collaborator' || role === 'member';
  }, [currentUser, getUserRoleInProject]);

  /**
   * Check if user can edit project
   * Owner, Admin/Collaborator - can edit project
   * Member, Viewer - cannot edit project
   */
  const canEditProject = React.useCallback((projectId: string): boolean => {
    const role = getUserRoleInProject(projectId);
    return role === 'owner' || role === 'collaborator';
  }, [getUserRoleInProject]);

  /**
   * Check if user can delete project
   * Only Owner can delete project
   */
  const canDeleteProject = React.useCallback((projectId: string): boolean => {
    const role = getUserRoleInProject(projectId);
    return role === 'owner';
  }, [getUserRoleInProject]);

  const value: AppContextType = {
    tasks,
    projects,
    currentUser,
    teamMembers,
    customColumns,
    isLoading,
    isRealtimeConnected,
    fetchTasks,
    fetchProjects,
    fetchCurrentUser,
    fetchTeamMembers,
    fetchCustomColumns,
    saveCustomColumns,
    updateCurrentUser,
    uploadAvatar,
    deleteAvatar,
    createTask,
    updateTask,
    deleteTask,
    uploadTaskAttachment,
    deleteTaskAttachment,
    createProject,
    updateProject,
    deleteProject,
    refreshData,
    // Permission helpers
    getUserRoleInProject,
    canViewAllProjectTasks,
    canEditTask,
    canCreateTask,
    canEditProject,
    canDeleteProject,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
