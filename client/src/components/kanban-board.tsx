import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { MoreHorizontal, Calendar, Flame, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import type { Filters } from './filters-panel';

type Task = {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  project: string;
  projectId: string;
  projectColor: string;
  category: string;
  categoryId: string;
  categoryColor: string;
  assignee: string;
  assigneeId: string;
  dueDate: string;
  dueDateRaw: Date;
  tags: string[];
  status: string;
};

type Column = {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
};

const mockColumns: Column[] = [
  {
    id: 'assigned',
    title: 'Назначено',
    color: 'bg-gray-500',
    tasks: [
      {
        id: '1',
        title: 'Разработать дизайн главной страницы',
        description: 'Создать макеты в Figma',
        priority: 'high',
        project: 'Веб-сайт',
        projectId: 'website',
        projectColor: 'bg-purple-500',
        category: 'Дизайн',
        categoryId: 'design',
        categoryColor: 'bg-pink-500',
        assignee: 'АП',
        assigneeId: 'ap',
        dueDate: '15 ноя',
        dueDateRaw: new Date('2024-11-15'),
        tags: ['UI/UX', 'срочно'],
        status: 'assigned',
      },
      {
        id: '2',
        title: 'Написать документацию API',
        description: 'Описать все эндпоинты',
        priority: 'medium',
        project: 'Backend',
        projectId: 'backend',
        projectColor: 'bg-green-500',
        category: 'Документация',
        categoryId: 'documentation',
        categoryColor: 'bg-blue-500',
        assignee: 'МИ',
        assigneeId: 'mi',
        dueDate: '18 ноя',
        dueDateRaw: new Date('2024-11-18'),
        tags: ['API', 'backend'],
        status: 'assigned',
      },
    ],
  },
  {
    id: 'in-progress',
    title: 'В работе',
    color: 'bg-blue-500',
    tasks: [
      {
        id: '3',
        title: 'Интеграция платежной системы',
        description: 'Подключить Stripe',
        priority: 'high',
        project: 'Веб-сайт',
        projectId: 'website',
        projectColor: 'bg-purple-500',
        category: 'Разработка',
        categoryId: 'development',
        categoryColor: 'bg-purple-500',
        assignee: 'ЕС',
        assigneeId: 'es',
        dueDate: '12 ноя',
        dueDateRaw: new Date('2024-11-12'),
        tags: ['payments', 'integration'],
        status: 'in-progress',
      },
      {
        id: '7',
        title: 'Оптимизация базы данных',
        description: 'Улучшить производительность запросов',
        priority: 'medium',
        project: 'Backend',
        projectId: 'backend',
        projectColor: 'bg-green-500',
        category: 'Разработка',
        categoryId: 'development',
        categoryColor: 'bg-purple-500',
        assignee: 'АП',
        assigneeId: 'ap',
        dueDate: '20 ноя',
        dueDateRaw: new Date('2024-11-20'),
        tags: ['database', 'optimization'],
        status: 'in-progress',
      },
    ],
  },
  {
    id: 'review',
    title: 'На проверке',
    color: 'bg-orange-500',
    tasks: [
      {
        id: '4',
        title: 'Код-ревью функции авторизации',
        description: 'Проверить безопасность',
        priority: 'high',
        project: 'Backend',
        projectId: 'backend',
        projectColor: 'bg-green-500',
        category: 'Тестирование',
        categoryId: 'testing',
        categoryColor: 'bg-green-500',
        assignee: 'АП',
        assigneeId: 'ap',
        dueDate: '10 ноя',
        dueDateRaw: new Date('2024-11-10'),
        tags: ['security', 'code-review'],
        status: 'review',
      },
      {
        id: '5',
        title: 'Тестирование мобильной версии',
        description: 'Проверить на разных устройствах',
        priority: 'medium',
        project: 'Мобильное приложение',
        projectId: 'mobile',
        projectColor: 'bg-pink-500',
        category: 'Тестирование',
        categoryId: 'testing',
        categoryColor: 'bg-green-500',
        assignee: 'МИ',
        assigneeId: 'mi',
        dueDate: '13 ноя',
        dueDateRaw: new Date('2024-11-13'),
        tags: ['mobile', 'testing'],
        status: 'review',
      },
    ],
  },
  {
    id: 'done',
    title: 'Готово',
    color: 'bg-green-500',
    tasks: [
      {
        id: '6',
        title: 'Настройка CI/CD pipeline',
        description: 'GitHub Actions',
        priority: 'low',
        project: 'DevOps',
        projectId: 'devops',
        projectColor: 'bg-orange-500',
        category: 'Разработка',
        categoryId: 'development',
        categoryColor: 'bg-purple-500',
        assignee: 'ЕС',
        assigneeId: 'es',
        dueDate: '8 ноя',
        dueDateRaw: new Date('2024-11-08'),
        tags: ['devops', 'automation'],
        status: 'done',
      },
    ],
  },
];

type GroupBy = 'none' | 'project' | 'priority';

export function KanbanBoard({
  searchQuery,
  filters,
  onTaskClick,
}: {
  searchQuery: string;
  filters: Filters;
  onTaskClick: (taskId: string) => void;
}) {
  const [groupBy, setGroupBy] = React.useState<GroupBy>('none');

  const isOverdue = (dueDate: Date) => {
    return dueDate < new Date() && dueDate.toDateString() !== new Date().toDateString();
  };

  const filteredColumns = React.useMemo(() => {
    const filterTasks = (task: Task) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !task.title.toLowerCase().includes(query) &&
          !task.description.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Filters
      if (filters.projects.length > 0 && !filters.projects.includes(task.projectId)) {
        return false;
      }
      if (filters.categories.length > 0 && !filters.categories.includes(task.categoryId)) {
        return false;
      }
      if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) {
        return false;
      }
      if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
        return false;
      }
      if (filters.assignees.length > 0 && !filters.assignees.includes(task.assigneeId)) {
        return false;
      }
      if (filters.tags.length > 0) {
        const hasTag = filters.tags.some((tag) => task.tags.includes(tag));
        if (!hasTag) return false;
      }
      if (filters.deadlineFrom) {
        const from = new Date(filters.deadlineFrom);
        if (task.dueDateRaw < from) return false;
      }
      if (filters.deadlineTo) {
        const to = new Date(filters.deadlineTo);
        if (task.dueDateRaw > to) return false;
      }

      return true;
    };

    return mockColumns.map((column) => ({
      ...column,
      tasks: column.tasks.filter(filterTasks),
    }));
  }, [searchQuery, filters]);

  const groupedColumns = React.useMemo(() => {
    if (groupBy === 'none') {
      return filteredColumns;
    }

    // For grouping, we'll show tasks grouped within each column
    return filteredColumns;
  }, [filteredColumns, groupBy]);

  const renderTaskCard = (task: Task) => {
    const overdue = isOverdue(task.dueDateRaw);

    return (
      <Card
        key={task.id}
        className={`cursor-pointer hover:shadow-md transition-shadow ${
          task.status === 'done' ? 'opacity-60' : ''
        }`}
        onClick={() => onTaskClick(task.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge className={task.projectColor} variant="secondary">
              {task.project}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          <h4 className={`mt-1 ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h4>
        </CardHeader>
        <CardContent className="pb-3 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`${task.categoryColor} text-white border-0`}>
              <Tag className="w-3 h-3 mr-1" />
              {task.category}
            </Badge>
            
            <Badge
              variant="outline"
              className={`${
                task.priority === 'urgent'
                  ? 'bg-orange-100 text-orange-700 border-orange-300'
                  : task.priority === 'high'
                  ? 'bg-red-100 text-red-700 border-red-300'
                  : task.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              }`}
            >
              {task.priority === 'urgent' && <Flame className="w-3 h-3 mr-1 fill-current" />}
              {task.priority === 'urgent' && 'Срочный'}
              {task.priority === 'high' && 'Высокий'}
              {task.priority === 'medium' && 'Средний'}
              {task.priority === 'low' && 'Низкий'}
            </Badge>
          </div>

          {task.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className={`flex items-center gap-1 ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
              <Calendar className="w-4 h-4" />
              <span className={overdue ? 'font-medium' : ''}>{task.dueDate}</span>
            </div>
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                {task.assignee}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderGroupedTasks = (tasks: Task[]) => {
    if (groupBy === 'none') {
      return tasks.map(renderTaskCard);
    }

    if (groupBy === 'project') {
      const grouped = tasks.reduce((acc, task) => {
        if (!acc[task.project]) acc[task.project] = [];
        acc[task.project].push(task);
        return acc;
      }, {} as Record<string, Task[]>);

      return Object.entries(grouped).map(([project, projectTasks]) => (
        <div key={project} className="space-y-2">
          <div className="text-sm text-gray-600 px-2 py-1">{project}</div>
          {projectTasks.map(renderTaskCard)}
        </div>
      ));
    }

    if (groupBy === 'priority') {
      const priorityOrder = ['high', 'medium', 'low'];
      const grouped = tasks.reduce((acc, task) => {
        if (!acc[task.priority]) acc[task.priority] = [];
        acc[task.priority].push(task);
        return acc;
      }, {} as Record<string, Task[]>);

      return priorityOrder.map((priority) => {
        const priorityTasks = grouped[priority] || [];
        if (priorityTasks.length === 0) return null;

        const labels = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };
        return (
          <div key={priority} className="space-y-2">
            <div className="text-sm text-gray-600 px-2 py-1">{labels[priority as keyof typeof labels]}</div>
            {priorityTasks.map(renderTaskCard)}
          </div>
        );
      }).filter(Boolean);
    }

    return tasks.map(renderTaskCard);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="border-b bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <Label className="text-sm text-gray-600">Группировка:</Label>
          <div className="flex gap-2">
            <Button
              variant={groupBy === 'none' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGroupBy('none')}
              className={groupBy === 'none' ? 'bg-purple-600' : ''}
            >
              Без группировки
            </Button>
            <Button
              variant={groupBy === 'project' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGroupBy('project')}
              className={groupBy === 'project' ? 'bg-purple-600' : ''}
            >
              По проекту
            </Button>
            <Button
              variant={groupBy === 'priority' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGroupBy('priority')}
              className={groupBy === 'priority' ? 'bg-purple-600' : ''}
            >
              По приоритету
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-6 h-full min-w-max">
          {groupedColumns.map((column) => (
            <div key={column.id} className="flex flex-col w-80 flex-shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="text-gray-900">{column.title}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {column.tasks.length}
                </Badge>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto">
                {renderGroupedTasks(column.tasks)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
