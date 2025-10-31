import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Flame, Tag } from 'lucide-react';
import type { Filters } from './filters-panel';

type Task = {
  id: string;
  title: string;
  status: string;
  statusId: string;
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
  updatedAt: string;
  updatedAtRaw: Date;
  tags: string[];
};

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Разработать дизайн главной страницы',
    status: 'Назначено',
    statusId: 'assigned',
    priority: 'high',
    project: 'Веб-сайт',
    projectId: 'website',
    projectColor: 'bg-purple-500',
    category: 'Дизайн',
    categoryId: 'design',
    categoryColor: 'bg-pink-500',
    assignee: 'АП',
    assigneeId: 'ap',
    dueDate: '15 ноя 2024',
    dueDateRaw: new Date('2024-11-15'),
    updatedAt: '2 часа назад',
    updatedAtRaw: new Date(Date.now() - 2 * 60 * 60 * 1000),
    tags: ['UI/UX', 'срочно'],
  },
  {
    id: '2',
    title: 'Написать документацию API',
    status: 'Назначено',
    statusId: 'assigned',
    priority: 'medium',
    project: 'Backend',
    projectId: 'backend',
    projectColor: 'bg-green-500',
    category: 'Документация',
    categoryId: 'documentation',
    categoryColor: 'bg-blue-500',
    assignee: 'МИ',
    assigneeId: 'mi',
    dueDate: '18 ноя 2024',
    dueDateRaw: new Date('2024-11-18'),
    updatedAt: '5 часов назад',
    updatedAtRaw: new Date(Date.now() - 5 * 60 * 60 * 1000),
    tags: ['API', 'backend'],
  },
  {
    id: '3',
    title: 'Интеграция платежной системы',
    status: 'В работе',
    statusId: 'in-progress',
    priority: 'high',
    project: 'Веб-сайт',
    projectId: 'website',
    projectColor: 'bg-purple-500',
    category: 'Разработка',
    categoryId: 'development',
    categoryColor: 'bg-purple-500',
    assignee: 'ЕС',
    assigneeId: 'es',
    dueDate: '12 ноя 2024',
    dueDateRaw: new Date('2024-11-12'),
    updatedAt: '1 час назад',
    updatedAtRaw: new Date(Date.now() - 1 * 60 * 60 * 1000),
    tags: ['payments', 'integration'],
  },
  {
    id: '4',
    title: 'Код-ревью функции авторизации',
    status: 'На проверке',
    statusId: 'review',
    priority: 'high',
    project: 'Backend',
    projectId: 'backend',
    projectColor: 'bg-green-500',
    category: 'Тестирование',
    categoryId: 'testing',
    categoryColor: 'bg-green-500',
    assignee: 'АП',
    assigneeId: 'ap',
    dueDate: '10 ноя 2024',
    dueDateRaw: new Date('2024-11-10'),
    updatedAt: '30 минут назад',
    updatedAtRaw: new Date(Date.now() - 30 * 60 * 1000),
    tags: ['security', 'code-review'],
  },
  {
    id: '5',
    title: 'Тестирование мобильной версии',
    status: 'На проверке',
    statusId: 'review',
    priority: 'medium',
    project: 'Мобильное приложение',
    projectId: 'mobile',
    projectColor: 'bg-pink-500',
    category: 'Тестирование',
    categoryId: 'testing',
    categoryColor: 'bg-green-500',
    assignee: 'МИ',
    assigneeId: 'mi',
    dueDate: '13 ноя 2024',
    dueDateRaw: new Date('2024-11-13'),
    updatedAt: '3 часа назад',
    updatedAtRaw: new Date(Date.now() - 3 * 60 * 60 * 1000),
    tags: ['mobile', 'testing'],
  },
  {
    id: '6',
    title: 'Настройка CI/CD pipeline',
    status: 'Готово',
    statusId: 'done',
    priority: 'low',
    project: 'DevOps',
    projectId: 'devops',
    projectColor: 'bg-orange-500',
    category: 'Разработка',
    categoryId: 'development',
    categoryColor: 'bg-purple-500',
    assignee: 'ЕС',
    assigneeId: 'es',
    dueDate: '8 ноя 2024',
    dueDateRaw: new Date('2024-11-08'),
    updatedAt: '1 день назад',
    updatedAtRaw: new Date(Date.now() - 24 * 60 * 60 * 1000),
    tags: ['devops', 'automation'],
  },
  {
    id: '7',
    title: 'Оптимизация базы данных',
    status: 'В работе',
    statusId: 'in-progress',
    priority: 'medium',
    project: 'Backend',
    projectId: 'backend',
    projectColor: 'bg-green-500',
    category: 'Разработка',
    categoryId: 'development',
    categoryColor: 'bg-purple-500',
    assignee: 'АП',
    assigneeId: 'ap',
    dueDate: '20 ноя 2024',
    dueDateRaw: new Date('2024-11-20'),
    updatedAt: '4 часа назад',
    updatedAtRaw: new Date(Date.now() - 4 * 60 * 60 * 1000),
    tags: ['database', 'optimization'],
  },
];

const statusColors = {
  'Назначено': 'bg-gray-100 text-gray-700',
  'В работе': 'bg-blue-100 text-blue-700',
  'На проверке': 'bg-orange-100 text-orange-700',
  'Готово': 'bg-green-100 text-green-700',
};

type SortColumn = 'title' | 'status' | 'priority' | 'project' | 'category' | 'assignee' | 'dueDate' | 'updatedAt';
type SortDirection = 'asc' | 'desc' | null;

export function TaskTable({
  searchQuery,
  filters,
  onTaskClick,
}: {
  searchQuery: string;
  filters: Filters;
  onTaskClick: (taskId: string) => void;
}) {
  const [selectedTasks, setSelectedTasks] = React.useState<string[]>([]);
  const [sortColumn, setSortColumn] = React.useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null);

  const isOverdue = (dueDate: Date) => {
    return dueDate < new Date() && dueDate.toDateString() !== new Date().toDateString();
  };

  const filteredAndSortedTasks = React.useMemo(() => {
    const filterTasks = (task: Task) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!task.title.toLowerCase().includes(query)) {
          return false;
        }
      }

      if (filters.projects.length > 0 && !filters.projects.includes(task.projectId)) {
        return false;
      }
      if (filters.categories.length > 0 && !filters.categories.includes(task.categoryId)) {
        return false;
      }
      if (filters.statuses.length > 0 && !filters.statuses.includes(task.statusId)) {
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

    let result = mockTasks.filter(filterTasks);

    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        let aVal: any = a[sortColumn];
        let bVal: any = b[sortColumn];

        // Handle date columns
        if (sortColumn === 'dueDate') {
          aVal = a.dueDateRaw;
          bVal = b.dueDateRaw;
        } else if (sortColumn === 'updatedAt') {
          aVal = a.updatedAtRaw;
          bVal = b.updatedAtRaw;
        }

        // Handle priority
        if (sortColumn === 'priority') {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aVal = priorityOrder[a.priority];
          bVal = priorityOrder[b.priority];
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [searchQuery, filters, sortColumn, sortDirection]);

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const toggleAll = () => {
    if (selectedTasks.length === filteredAndSortedTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredAndSortedTasks.map((task) => task.id));
    }
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 ml-1 text-purple-600" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 text-purple-600" />
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  selectedTasks.length === filteredAndSortedTasks.length &&
                  filteredAndSortedTasks.length > 0
                }
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <TableHead>
              <button
                className="flex items-center hover:text-purple-600"
                onClick={() => handleSort('title')}
              >
                Задача
                <SortIcon column="title" />
              </button>
            </TableHead>
            <TableHead>
              <button
                className="flex items-center hover:text-purple-600"
                onClick={() => handleSort('project')}
              >
                Проект
                <SortIcon column="project" />
              </button>
            </TableHead>
            <TableHead>
              <button
                className="flex items-center hover:text-purple-600"
                onClick={() => handleSort('category')}
              >
                Категория
                <SortIcon column="category" />
              </button>
            </TableHead>
            <TableHead>
              <button
                className="flex items-center hover:text-purple-600"
                onClick={() => handleSort('status')}
              >
                Статус
                <SortIcon column="status" />
              </button>
            </TableHead>
            <TableHead>
              <button
                className="flex items-center hover:text-purple-600"
                onClick={() => handleSort('priority')}
              >
                Приоритет
                <SortIcon column="priority" />
              </button>
            </TableHead>
            <TableHead>
              <button
                className="flex items-center hover:text-purple-600"
                onClick={() => handleSort('assignee')}
              >
                Исполнитель
                <SortIcon column="assignee" />
              </button>
            </TableHead>
            <TableHead>
              <button
                className="flex items-center hover:text-purple-600"
                onClick={() => handleSort('dueDate')}
              >
                Дедлайн
                <SortIcon column="dueDate" />
              </button>
            </TableHead>
            <TableHead>
              <button
                className="flex items-center hover:text-purple-600"
                onClick={() => handleSort('updatedAt')}
              >
                Обновлено
                <SortIcon column="updatedAt" />
              </button>
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedTasks.map((task) => {
            const overdue = isOverdue(task.dueDateRaw);
            return (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onTaskClick(task.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="max-w-md">
                    <p className="truncate">{task.title}</p>
                    {task.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {task.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{task.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={task.projectColor} variant="secondary">
                    {task.project}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${task.categoryColor} text-white border-0`}>
                    {task.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[task.status as keyof typeof statusColors]}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {task.priority === 'high' && (
                      <Flame className="w-4 h-4 text-red-600 fill-current" />
                    )}
                    <span className="text-sm">
                      {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                      {task.assignee}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                    {task.dueDate}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500">{task.updatedAt}</span>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
