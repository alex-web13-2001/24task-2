import React from 'react';
import { LayoutGrid, Table as TableIcon, Info, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ProjectKanbanBoard } from './project-kanban-board';
import { TaskTable } from './task-table';
import { TaskModal } from './task-modal';
import { ProjectAboutModal } from './project-about-modal';
import { ProjectMembersModal } from './project-members-modal';
import type { Filters } from './filters-panel';

type ProjectDetailViewProps = {
  projectId: string;
  onBack?: () => void;
};

// Mock project data
const getProjectData = (id: string) => ({
  id,
  name: 'Веб-сайт компании',
  color: 'bg-purple-500',
  description: 'Разработка корпоративного веб-сайта с современным дизайном',
});

export function ProjectDetailView({ projectId, onBack }: ProjectDetailViewProps) {
  const project = getProjectData(projectId);
  
  const [viewMode, setViewMode] = React.useState<'kanban' | 'table'>('kanban');
  const [isAboutModalOpen, setIsAboutModalOpen] = React.useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = React.useState(false);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Фильтры
  const [categoryFilter, setCategoryFilter] = React.useState<string[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = React.useState<string>('all');
  const [deadlineFrom, setDeadlineFrom] = React.useState('');
  const [deadlineTo, setDeadlineTo] = React.useState('');

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const filters: Filters = {
    projects: [projectId],
    categories: categoryFilter,
    statuses: statusFilter !== 'all' ? [statusFilter] : [],
    priorities: priorityFilter !== 'all' ? [priorityFilter] : [],
    assignees: assigneeFilter !== 'all' ? [assigneeFilter] : [],
    tags: [],
    deadlineFrom,
    deadlineTo,
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Верхняя панель проекта */}
      <div className="border-b bg-white px-4 md:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${project.color}`} />
              <h1 className="text-gray-900">{project.name}</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAboutModalOpen(true)}
            >
              <Info className="w-4 h-4 mr-2" />
              О проекте
            </Button>
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="space-y-3">
          <Input
            placeholder="Поиск по названию задачи..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-3">
            {/* Переключатель режимов */}
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className={viewMode === 'kanban' ? 'bg-purple-600' : ''}
              >
                <LayoutGrid className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Kanban</span>
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className={viewMode === 'table' ? 'bg-purple-600' : ''}
              >
                <TableIcon className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Таблица</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600">Категория:</Label>
              <Select
                value={categoryFilter[0] || 'all'}
                onValueChange={(value) => setCategoryFilter(value === 'all' ? [] : [value])}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="development">Разработка</SelectItem>
                  <SelectItem value="design">Дизайн</SelectItem>
                  <SelectItem value="testing">Тестирование</SelectItem>
                  <SelectItem value="documentation">Документация</SelectItem>
                  <SelectItem value="bugs">Баги</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600">Статус:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="assigned">Назначено</SelectItem>
                  <SelectItem value="in-progress">В работе</SelectItem>
                  <SelectItem value="review">На проверке</SelectItem>
                  <SelectItem value="done">Готово</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600">Приоритет:</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="urgent">Срочный🔥</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="low">Низкий</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600">Исполнитель:</Label>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="ap">Александр Петров</SelectItem>
                  <SelectItem value="mi">Мария Иванова</SelectItem>
                  <SelectItem value="es">Евгений Смирнов</SelectItem>
                  <SelectItem value="dk">Дмитрий Козлов</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(categoryFilter.length > 0 ||
              statusFilter !== 'all' ||
              priorityFilter !== 'all' ||
              assigneeFilter !== 'all' ||
              searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCategoryFilter([]);
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setAssigneeFilter('all');
                  setSearchQuery('');
                }}
              >
                Сбросить
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Основная область */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <ProjectKanbanBoard
            projectId={projectId}
            searchQuery={searchQuery}
            filters={filters}
            onTaskClick={handleTaskClick}
          />
        ) : (
          <TaskTable
            searchQuery={searchQuery}
            filters={filters}
            onTaskClick={handleTaskClick}
          />
        )}
      </div>

      {/* Модальные окна */}
      {selectedTaskId && (
        <TaskModal
          open={!!selectedTaskId}
          onOpenChange={(open) => !open && setSelectedTaskId(null)}
          mode="view"
          taskId={selectedTaskId}
        />
      )}

      <ProjectAboutModal
        open={isAboutModalOpen}
        onOpenChange={setIsAboutModalOpen}
        projectId={projectId}
        currentUserRole="owner"
        onManageMembers={() => {
          setIsAboutModalOpen(false);
          setIsMembersModalOpen(true);
        }}
      />

      <ProjectMembersModal
        open={isMembersModalOpen}
        onOpenChange={setIsMembersModalOpen}
        projectId={projectId}
        projectName={project.name}
        projectColor={project.color}
        currentUserRole="owner"
      />
    </div>
  );
}
