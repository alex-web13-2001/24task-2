import React from 'react';
import { LayoutGrid, List, X, Search } from 'lucide-react';
import { Button } from './ui/button';
import { KanbanBoard } from './kanban-board';
import { TaskTable } from './task-table';
import { TaskModal } from './task-modal';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';

type Filters = {
  projects: string[];
  categories: string[];
  statuses: string[];
  priorities: string[];
  assignees: string[];
  tags: string[];
  deadlineFrom: string;
  deadlineTo: string;
};

const projectsList = [
  { id: 'website', name: 'Веб-сайт', color: 'bg-purple-500' },
  { id: 'backend', name: 'Backend', color: 'bg-green-500' },
  { id: 'mobile', name: 'Мобильное приложение', color: 'bg-pink-500' },
  { id: 'devops', name: 'DevOps', color: 'bg-orange-500' },
  { id: 'design', name: 'Дизайн система', color: 'bg-blue-500' },
];

const categoriesList = [
  { id: 'development', name: 'Разработка' },
  { id: 'design', name: 'Дизайн' },
  { id: 'testing', name: 'Тестирование' },
  { id: 'documentation', name: 'Документация' },
  { id: 'bugs', name: 'Баги' },
];

const statusesList = [
  { id: 'assigned', name: 'Назначено' },
  { id: 'in-progress', name: 'В работе' },
  { id: 'review', name: 'На проверке' },
  { id: 'done', name: 'Готово' },
];

const prioritiesList = [
  { id: 'low', name: 'Низкий' },
  { id: 'medium', name: 'Средний' },
  { id: 'high', name: 'Высокий' },
];

const assigneesList = [
  { id: 'ap', name: 'Александр Петров' },
  { id: 'mi', name: 'Мария Иванова' },
  { id: 'es', name: 'Евгений Смирнов' },
  { id: 'dk', name: 'Дмитрий Козлов' },
];

export function DashboardView() {
  const [viewMode, setViewMode] = React.useState<'kanban' | 'table'>('kanban');
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<Filters>({
    projects: [],
    categories: [],
    statuses: [],
    priorities: [],
    assignees: [],
    tags: [],
    deadlineFrom: '',
    deadlineTo: '',
  });

  const handleClearFilters = () => {
    setFilters({
      projects: [],
      categories: [],
      statuses: [],
      priorities: [],
      assignees: [],
      tags: [],
      deadlineFrom: '',
      deadlineTo: '',
    });
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const toggleArrayFilter = (key: keyof Filters, value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    setFilters({ ...filters, [key]: newValues });
  };

  const hasActiveFilters =
    filters.projects.length > 0 ||
    filters.categories.length > 0 ||
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assignees.length > 0 ||
    filters.tags.length > 0 ||
    filters.deadlineFrom ||
    filters.deadlineTo;

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-gray-900 mb-1">Дашборд</h1>
            <p className="text-gray-600">Обзор всех задач из проектов и личных задач</p>
          </div>
        </div>

        {/* Поиск и переключатель вида */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск по названию или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Label className="text-sm text-gray-600 hidden sm:inline">Вид:</Label>
            <div className="flex border rounded-lg bg-white">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className={`${viewMode === 'kanban' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
              >
                <LayoutGrid className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Kanban</span>
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className={`${viewMode === 'table' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
              >
                <List className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Таблица</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Фильтры */}
        <div className="flex items-center gap-2 flex-wrap">
          <Label className="text-sm text-gray-600">Фильтры:</Label>

          {/* Проект */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Проект
                {filters.projects.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1 min-w-[20px] h-5">
                    {filters.projects.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Проект</Label>
                  {filters.projects.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({ ...filters, projects: [] })}
                      className="h-auto p-0 text-xs text-purple-600"
                    >
                      Очистить
                    </Button>
                  )}
                </div>
                {projectsList.map((project) => (
                  <div key={project.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`project-${project.id}`}
                      checked={filters.projects.includes(project.id)}
                      onCheckedChange={() => toggleArrayFilter('projects', project.id)}
                    />
                    <label
                      htmlFor={`project-${project.id}`}
                      className="text-sm flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <div className={`w-3 h-3 ${project.color} rounded-sm`} />
                      {project.name}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Категория */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Категория
                {filters.categories.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1 min-w-[20px] h-5">
                    {filters.categories.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="start">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Категория</Label>
                  {filters.categories.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({ ...filters, categories: [] })}
                      className="h-auto p-0 text-xs text-purple-600"
                    >
                      Очистить
                    </Button>
                  )}
                </div>
                {categoriesList.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={() => toggleArrayFilter('categories', category.id)}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Статус */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Статус
                {filters.statuses.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1 min-w-[20px] h-5">
                    {filters.statuses.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="start">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Статус</Label>
                  {filters.statuses.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({ ...filters, statuses: [] })}
                      className="h-auto p-0 text-xs text-purple-600"
                    >
                      Очистить
                    </Button>
                  )}
                </div>
                {statusesList.map((status) => (
                  <div key={status.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.id}`}
                      checked={filters.statuses.includes(status.id)}
                      onCheckedChange={() => toggleArrayFilter('statuses', status.id)}
                    />
                    <label
                      htmlFor={`status-${status.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {status.name}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Приоритет */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Приоритет
                {filters.priorities.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1 min-w-[20px] h-5">
                    {filters.priorities.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="start">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Приоритет</Label>
                  {filters.priorities.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({ ...filters, priorities: [] })}
                      className="h-auto p-0 text-xs text-purple-600"
                    >
                      Очистить
                    </Button>
                  )}
                </div>
                {prioritiesList.map((priority) => (
                  <div key={priority.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority.id}`}
                      checked={filters.priorities.includes(priority.id)}
                      onCheckedChange={() => toggleArrayFilter('priorities', priority.id)}
                    />
                    <label
                      htmlFor={`priority-${priority.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {priority.name}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Исполнитель */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Исполнитель
                {filters.assignees.length > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1 min-w-[20px] h-5">
                    {filters.assignees.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="start">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Исполнитель</Label>
                  {filters.assignees.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({ ...filters, assignees: [] })}
                      className="h-auto p-0 text-xs text-purple-600"
                    >
                      Очистить
                    </Button>
                  )}
                </div>
                {assigneesList.map((assignee) => (
                  <div key={assignee.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`assignee-${assignee.id}`}
                      checked={filters.assignees.includes(assignee.id)}
                      onCheckedChange={() => toggleArrayFilter('assignees', assignee.id)}
                    />
                    <label
                      htmlFor={`assignee-${assignee.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {assignee.name}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Дедлайн */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Дедлайн
                {(filters.deadlineFrom || filters.deadlineTo) && (
                  <Badge variant="secondary" className="ml-2 px-1 min-w-[20px] h-5">
                    1
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start">
              <div className="space-y-3">
                <Label className="text-sm">Диапазон дедлайна</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="deadline-from" className="text-xs text-gray-500">
                      От
                    </Label>
                    <Input
                      id="deadline-from"
                      type="date"
                      value={filters.deadlineFrom}
                      onChange={(e) =>
                        setFilters({ ...filters, deadlineFrom: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline-to" className="text-xs text-gray-500">
                      До
                    </Label>
                    <Input
                      id="deadline-to"
                      type="date"
                      value={filters.deadlineTo}
                      onChange={(e) =>
                        setFilters({ ...filters, deadlineTo: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 text-purple-600"
            >
              <X className="w-4 h-4 mr-1" />
              Сбросить все
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <KanbanBoard searchQuery={searchQuery} filters={filters} onTaskClick={handleTaskClick} />
        ) : (
          <TaskTable searchQuery={searchQuery} filters={filters} onTaskClick={handleTaskClick} />
        )}
      </div>

      {selectedTaskId && (
        <TaskModal
          open={!!selectedTaskId}
          onOpenChange={(open) => !open && setSelectedTaskId(null)}
          mode="view"
          taskId={selectedTaskId}
        />
      )}
    </div>
  );
}
