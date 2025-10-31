import React from 'react';
import { Plus, Search, MoreVertical, Users, Calendar, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Card, CardContent, CardHeader } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ProjectModal } from './project-modal';
import { ProjectAboutModal } from './project-about-modal';
import { ProjectMembersModal } from './project-members-modal';

type Project = {
  id: string;
  name: string;
  description: string;
  color: string;
  role: 'owner' | 'member' | 'observer';
  owner: string;
  ownerShort: string;
  totalTasks: number;
  overdueTasks: number;
  lastUpdated: string;
  isArchived: boolean;
  isMine: boolean;
};

const mockProjects: Project[] = [
  {
    id: 'website',
    name: 'Веб-сайт компании',
    description: 'Разработка корпоративного веб-сайта',
    color: 'bg-purple-500',
    role: 'owner',
    owner: 'Мария Иванова',
    ownerShort: 'МИ',
    totalTasks: 24,
    overdueTasks: 2,
    lastUpdated: '2 часа назад',
    isArchived: false,
    isMine: true,
  },
  {
    id: 'backend',
    name: 'Backend API',
    description: 'Разработка REST API для мобильного приложения',
    color: 'bg-green-500',
    role: 'member',
    owner: 'Александр Петров',
    ownerShort: 'АП',
    totalTasks: 18,
    overdueTasks: 0,
    lastUpdated: '5 часов назад',
    isArchived: false,
    isMine: false,
  },
  {
    id: 'mobile',
    name: 'Мобильное приложение',
    description: 'iOS и Android приложение для клиентов',
    color: 'bg-pink-500',
    role: 'member',
    owner: 'Евгений Смирнов',
    ownerShort: 'ЕС',
    totalTasks: 31,
    overdueTasks: 5,
    lastUpdated: '1 день назад',
    isArchived: false,
    isMine: false,
  },
  {
    id: 'devops',
    name: 'DevOps и инфраструктура',
    description: 'Настройка CI/CD и облачной инфраструктуры',
    color: 'bg-orange-500',
    role: 'observer',
    owner: 'Дмитрий Козлов',
    ownerShort: 'ДК',
    totalTasks: 12,
    overdueTasks: 1,
    lastUpdated: '3 дня назад',
    isArchived: false,
    isMine: false,
  },
  {
    id: 'design',
    name: 'Дизайн система',
    description: 'Разработка единой дизайн-системы',
    color: 'bg-blue-500',
    role: 'owner',
    owner: 'Мария Иванова',
    ownerShort: 'МИ',
    totalTasks: 15,
    overdueTasks: 0,
    lastUpdated: '1 неделю назад',
    isArchived: false,
    isMine: true,
  },
  {
    id: 'marketing',
    name: 'Маркетинг 2024',
    description: 'Маркетинговые кампании и продвижение',
    color: 'bg-red-500',
    role: 'member',
    owner: 'Александр Петров',
    ownerShort: 'АП',
    totalTasks: 8,
    overdueTasks: 0,
    lastUpdated: '2 недели назад',
    isArchived: true,
    isMine: false,
  },
];

const roleLabels = {
  owner: 'Владелец',
  member: 'Участник',
  observer: 'Наблюдатель',
};

const roleColors = {
  owner: 'bg-purple-100 text-purple-700',
  member: 'bg-blue-100 text-blue-700',
  observer: 'bg-gray-100 text-gray-700',
};

type ProjectsViewProps = {
  onProjectClick?: (projectId: string) => void;
};

export function ProjectsView({ onProjectClick }: ProjectsViewProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('active');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<string | null>(null);
  const [aboutProject, setAboutProject] = React.useState<string | null>(null);
  const [membersProject, setMembersProject] = React.useState<string | null>(null);

  const filteredProjects = React.useMemo(() => {
    return mockProjects.filter((project) => {
      // Поиск
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !project.name.toLowerCase().includes(query) &&
          !project.owner.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Фильтр по типу
      if (typeFilter === 'mine' && !project.isMine) return false;
      if (typeFilter === 'invited' && project.isMine) return false;

      // Фильтр по статусу
      if (statusFilter === 'active' && project.isArchived) return false;
      if (statusFilter === 'archived' && !project.isArchived) return false;

      return true;
    });
  }, [searchQuery, typeFilter, statusFilter]);

  const handleProjectAction = (projectId: string, action: string) => {
    console.log(`Action ${action} on project ${projectId}`);
    if (action === 'edit') {
      setEditingProject(projectId);
    }
  };

  const handleProjectClick = (projectId: string) => {
    onProjectClick?.(projectId);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Верхняя панель */}
      <div className="border-b bg-white px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-gray-900 mb-1">Проекты</h1>
            <p className="text-gray-600 text-sm">Управление всеми вашими проектами</p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать проект
          </Button>
        </div>

        {/* Поиск и фильтры */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск по названию или владельцу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все проекты</SelectItem>
                <SelectItem value="mine">Мои</SelectItem>
                <SelectItem value="invited">Приглашённые</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="archived">Архивированные</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Список проектов */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'active' ? (
              <>
                <h3 className="text-gray-900 mb-2">Проекты не найдены</h3>
                <p className="text-gray-600 mb-4">
                  Проекты по выбранным параметрам не найдены.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                    setStatusFilter('active');
                  }}
                >
                  Сбросить фильтры
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-gray-900 mb-2">У вас пока нет проектов</h3>
                <p className="text-gray-600 mb-4">
                  Создайте новый проект, чтобы начать работу.
                </p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Создать проект
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden group"
                onClick={() => handleProjectClick(project.id)}
              >
                {/* Цветная полоса */}
                <div className={`h-2 ${project.color}`} />

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate mb-2">{project.name}</h3>
                      <Badge variant="outline" className={roleColors[project.role]}>
                        {roleLabels[project.role]}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleProjectClick(project.id)}>
                          Открыть проект
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setAboutProject(project.id); }}>
                          О проекте
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setMembersProject(project.id); }}>
                          Участники
                        </DropdownMenuItem>
                        {project.role === 'owner' && (
                          <>
                            <DropdownMenuItem onClick={() => handleProjectAction(project.id, 'edit')}>
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleProjectAction(project.id, 'archive')}>
                              {project.isArchived ? 'Восстановить' : 'Архивировать'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleProjectAction(project.id, 'delete')}
                              className="text-red-600"
                            >
                              Удалить
                            </DropdownMenuItem>
                          </>
                        )}
                        {project.role !== 'owner' && (
                          <DropdownMenuItem
                            onClick={() => handleProjectAction(project.id, 'leave')}
                            className="text-red-600"
                          >
                            Выйти из проекта
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>

                  {/* Владелец */}
                  <div className="flex items-center gap-2 text-sm">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                        {project.ownerShort}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-600">{project.owner}</span>
                  </div>

                  {/* Статистика */}
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{project.totalTasks}</span>
                      </div>
                      {project.overdueTasks > 0 && (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>{project.overdueTasks}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">{project.lastUpdated}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно создания/редактирования проекта */}
      <ProjectModal
        open={isCreateModalOpen || !!editingProject}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) setEditingProject(null);
        }}
        mode={editingProject ? 'edit' : 'create'}
        projectId={editingProject || undefined}
        onManageMembers={
          editingProject
            ? () => {
                setMembersProject(editingProject);
                setEditingProject(null);
              }
            : undefined
        }
      />

      {/* Модальное окно информации о проекте */}
      {aboutProject && (
        <ProjectAboutModal
          open={!!aboutProject}
          onOpenChange={(open) => !open && setAboutProject(null)}
          projectId={aboutProject}
          currentUserRole="owner"
          onEdit={() => {
            setEditingProject(aboutProject);
            setAboutProject(null);
          }}
          onManageMembers={() => {
            setMembersProject(aboutProject);
            setAboutProject(null);
          }}
        />
      )}

      {/* Модальное окно управления участниками */}
      {membersProject && (
        <ProjectMembersModal
          open={!!membersProject}
          onOpenChange={(open) => !open && setMembersProject(null)}
          projectId={membersProject}
          projectName={mockProjects.find((p) => p.id === membersProject)?.name || ''}
          projectColor={mockProjects.find((p) => p.id === membersProject)?.color || 'bg-purple-500'}
          currentUserRole="owner"
        />
      )}
    </div>
  );
}
