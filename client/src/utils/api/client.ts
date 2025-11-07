// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    ...options.headers,
  };

  // Add Content-Type for JSON requests (unless it's FormData)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// ========== AUTH API ==========

export const authAPI = {
  signUp: async (email: string, password: string, name: string) => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    // Store token
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  },

  signIn: async (email: string, password: string) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  },

  signOut: async () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    try {
      const data = await apiRequest('/auth/me');
      return data.user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  updateProfile: async (updates: any) => {
    const data = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.user;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const data = await apiRequest('/auth/avatar', {
      method: 'POST',
      body: formData,
    });
    
    return data.avatar_url;
  },

  deleteAvatar: async () => {
    await apiRequest('/auth/avatar', {
      method: 'DELETE',
    });
    return true;
  },

  onAuthStateChange: (callback: (user: any) => void) => {
    // Check for token on mount
    const token = getAuthToken();
    if (token) {
      authAPI.getCurrentUser().then(callback);
    } else {
      callback(null);
    }
    
    // Return unsubscribe function
    return { data: { subscription: { unsubscribe: () => {} } } };
  },
};

// ========== TASKS API ==========

export const tasksAPI = {
  getAll: async () => {
    const data = await apiRequest('/tasks');
    return data.tasks;
  },

  create: async (taskData: any) => {
    const data = await apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    return data.task;
  },

  update: async (taskId: string, updates: any) => {
    const data = await apiRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.task;
  },

  delete: async (taskId: string) => {
    await apiRequest(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  addComment: async (taskId: string, text: string) => {
    const data = await apiRequest(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    return data.comment;
  },
};

// ========== PROJECTS API ==========

export const projectsAPI = {
  getAll: async () => {
    const data = await apiRequest('/projects');
    return data.projects;
  },

  create: async (projectData: any) => {
    const data = await apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    return data.project;
  },

  update: async (projectId: string, updates: any) => {
    const data = await apiRequest(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.project;
  },

  delete: async (projectId: string) => {
    await apiRequest(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  addMember: async (projectId: string, userId: string, role: string) => {
    await apiRequest(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, role }),
    });
  },

  removeMember: async (projectId: string, userId: string) => {
    await apiRequest(`/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    });
  },

  updateMemberRole: async (projectId: string, userId: string, role: string) => {
    await apiRequest(`/projects/${projectId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },
};

// ========== CATEGORIES API ==========

export const categoriesAPI = {
  getAll: async () => {
    // TODO: Implement categories endpoint on backend
    return [];
  },

  create: async (categoryData: any) => {
    // TODO: Implement categories endpoint on backend
    return categoryData;
  },

  update: async (categoryId: string, updates: any) => {
    // TODO: Implement categories endpoint on backend
    return updates;
  },

  delete: async (categoryId: string) => {
    // TODO: Implement categories endpoint on backend
  },
};

// Export API base URL for file uploads
export const getApiBaseUrl = () => API_BASE_URL.replace('/api', '');
