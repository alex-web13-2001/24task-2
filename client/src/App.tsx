import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';
import { AuthScreen } from './components/auth-screen';
import { SidebarNav } from './components/sidebar-nav';
import { Header } from './components/header';
import { DashboardView } from './components/dashboard-view';
import { ProjectsView } from './components/projects-view';
import { ProjectDetailView } from './components/project-detail-view';
import { TasksView } from './components/tasks-view';
import { CategoriesView } from './components/categories-view';
import { ArchiveView } from './components/archive-view';
import { ProfileView } from './components/profile-view';
import { TaskModal } from './components/task-modal';
import { SidebarProvider, SidebarInset } from './components/ui/sidebar';
import { Toaster } from './components/ui/sonner';
import { useAuthStore } from './store/authStore';

type View = 'dashboard' | 'tasks' | 'projects' | 'categories' | 'archive' | 'profile';

function App() {
  const { isAuthenticated, isLoading, loadUser, logout } = useAuthStore();
  const [currentView, setCurrentView] = React.useState<View>('dashboard');
  const [isCreateTaskOpen, setIsCreateTaskOpen] = React.useState(false);
  const [currentProject, setCurrentProject] = React.useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthScreen />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentProject(projectId);
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };

  const renderView = () => {
    if (selectedProjectId && currentView === 'projects') {
      return <ProjectDetailView projectId={selectedProjectId} onBack={handleBackToProjects} />;
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'projects':
        return <ProjectsView onProjectClick={handleProjectClick} />;
      case 'tasks':
        return <TasksView />;
      case 'categories':
        return <CategoriesView />;
      case 'archive':
        return <ArchiveView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <BrowserRouter>
      <SidebarProvider>
        <Header
          onCreateTask={() => setIsCreateTaskOpen(true)}
          onNavigate={(view) => setCurrentView(view as View)}
          onLogout={logout}
        />
        <SidebarNav
          currentView={currentView}
          onViewChange={(view) => setCurrentView(view as View)}
          onLogout={logout}
        />
        <SidebarInset className="flex flex-col pt-16">
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderView()}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <TaskModal
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        mode="create"
        initialProject={currentProject}
        onSave={(task) => console.log('Task created:', task)}
      />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
