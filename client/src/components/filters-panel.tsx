import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export type Filters = {
  projects: string[];
  categories: string[];
  statuses: string[];
  priorities: string[];
  assignees: string[];
  tags: string[];
  deadlineFrom: string;
  deadlineTo: string;
};

type FiltersPanelProps = {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
};

const projectsList = [
  { id: 'website', name: 'Веб-сайт', color: 'bg-purple-500' },
  { id: 'backend', name: 'Backend', color: 'bg-green-500' },
  { id: 'mobile', name: 'Мобильное приложение', color: 'bg-pink-500' },
  { id: 'devops', name: 'DevOps', color: 'bg-orange-500' },
  { id: 'design', name: 'Дизайн система', color: 'bg-blue-500' },
];

const categoriesList = [
  { id: 'development', name: 'Разработка', color: 'bg-purple-500' },
  { id: 'design', name: 'Дизайн', color: 'bg-pink-500' },
  { id: 'testing', name: 'Тестирование', color: 'bg-green-500' },
  { id: 'documentation', name: 'Документация', color: 'bg-blue-500' },
  { id: 'bugs', name: 'Баги', color: 'bg-red-500' },
];

const statusesList = [
  { id: 'assigned', name: 'Assigned' },
  { id: 'in-progress', name: 'In Progress' },
  { id: 'review', name: 'Review' },
  { id: 'done', name: 'Done' },
];

const prioritiesList = [
  { id: 'low', name: 'Низкий' },
  { id: 'medium', name: 'Средний' },
  { id: 'high', name: 'Высокий' },
  { id: 'urgent', name: 'Срочный🔥' },
];

const assigneesList = [
  { id: 'ap', name: 'Александр Петров' },
  { id: 'mi', name: 'Мария Иванова' },
  { id: 'es', name: 'Евгений Смирнов' },
  { id: 'dk', name: 'Дмитрий Козлов' },
];

export function FiltersPanel({ filters, onFiltersChange, onClearFilters }: FiltersPanelProps) {
  const [newTag, setNewTag] = React.useState('');

  const toggleArrayFilter = (key: keyof Filters, value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    onFiltersChange({ ...filters, [key]: newValues });
  };

  const addTag = () => {
    if (newTag.trim() && !filters.tags.includes(newTag.trim())) {
      onFiltersChange({ ...filters, tags: [...filters.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    onFiltersChange({ ...filters, tags: filters.tags.filter((t) => t !== tag) });
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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Filter className="w-4 h-4" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-600 rounded-full" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:max-w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Фильтры</SheetTitle>
          <SheetDescription>
            Настройте фильтры для отображения нужных задач
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Проект</Label>
              {filters.projects.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, projects: [] })}
                  className="h-auto p-0 text-xs text-purple-600"
                >
                  Очистить
                </Button>
              )}
            </div>
            <div className="space-y-2">
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
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Категория</Label>
              {filters.categories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, categories: [] })}
                  className="h-auto p-0 text-xs text-purple-600"
                >
                  Очистить
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {categoriesList.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={() => toggleArrayFilter('categories', category.id)}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <div className={`w-3 h-3 ${category.color} rounded-sm`} />
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Статус</Label>
              {filters.statuses.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, statuses: [] })}
                  className="h-auto p-0 text-xs text-purple-600"
                >
                  Очистить
                </Button>
              )}
            </div>
            <div className="space-y-2">
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
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Приоритет</Label>
              {filters.priorities.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, priorities: [] })}
                  className="h-auto p-0 text-xs text-purple-600"
                >
                  Очистить
                </Button>
              )}
            </div>
            <div className="space-y-2">
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
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Исполнитель</Label>
              {filters.assignees.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, assignees: [] })}
                  className="h-auto p-0 text-xs text-purple-600"
                >
                  Очистить
                </Button>
              )}
            </div>
            <div className="space-y-2">
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
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Дедлайн (диапазон)</Label>
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
                    onFiltersChange({ ...filters, deadlineFrom: e.target.value })
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
                    onFiltersChange({ ...filters, deadlineTo: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Теги</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Добавить тег"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} size="sm">
                Добавить
              </Button>
            </div>
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {filters.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClearFilters} className="flex-1">
              Сбросить все
            </Button>
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
              Применить
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
