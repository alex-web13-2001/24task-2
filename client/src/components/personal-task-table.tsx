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
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Flame } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

type Task = {
  id: string;
  title: string;
  status: string;
  statusId: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  dueDateRaw: Date;
  updatedAt: string;
  updatedAtRaw: Date;
  tags: string[];
};

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Купить продукты на неделю',
    status: 'Assigned',
    statusId: 'assigned',
    priority: 'medium',
    dueDate: '15 ноя 2024',
    dueDateRaw: new Date('2024-11-15'),
    updatedAt: '2 часа назад',
    updatedAtRaw: new Date(Date.now() - 2 * 60 * 60 * 1000),
    tags: ['покупки', 'дом'],
  },
  {
    id: '2',
    title: 'Записаться к врачу',
    status: 'Assigned',
    statusId: 'assigned',
    priority: 'high',
    dueDate: '12 ноя 2024',
    dueDateRaw: new Date('2024-11-12'),
    updatedAt: '1 час назад',
    updatedAtRaw: new Date(Date.now() - 1 * 60 * 60 * 1000),
    tags: ['здоровье', 'срочно'],
  },
  {
    id: '3',
    title: 'Подготовиться к презентации',
    status: 'Assigned',
    statusId: 'assigned',
    priority: 'high',
    dueDate: '13 ноя 2024',
    dueDateRaw: new Date('2024-11-13'),
    updatedAt: '3 часа назад',
    updatedAtRaw: new Date(Date.now() - 3 * 60 * 60 * 1000),
    tags: ['работа', 'презентация'],
  },
  {
    id: '4',
    title: 'Изучить новый фреймворк',
    status: 'In Progress',
    statusId: 'in-progress',
    priority: 'medium',
    dueDate: '20 ноя 2024',
    dueDateRaw: new Date('2024-11-20'),
    updatedAt: '30 минут назад',
    updatedAtRaw: new Date(Date.now() - 30 * 60 * 1000),
    tags: ['обучение', 'разработка'],
  },
  {
    id: '5',
    title: 'Организовать рабочий стол',
    status: 'In Progress',
    statusId: 'in-progress',
    priority: 'low',
    dueDate: '18 ноя 2024',
    dueDateRaw: new Date('2024-11-18'),
    updatedAt: '5 часов назад',
    updatedAtRaw: new Date(Date.now() - 5 * 60 * 60 * 1000),
    tags: ['организация', 'дом'],
  },
  {
    id: '6',
    title: 'Оплатить счета',
    status: 'Done',
    statusId: 'done',
    priority: 'medium',
    dueDate: '10 ноя 2024',
    dueDateRaw: new Date('2024-11-10'),
    updatedAt: '1 день назад',
    updatedAtRaw: new Date(Date.now() - 24 * 60 * 60 * 1000),
    tags: ['финансы'],
  },
  {
    id: '7',
    title: 'Прочитать статью по React',
    status: 'Done',
    statusId: 'done',
    priority: 'low',
    dueDate: '8 ноя 2024',
    dueDateRaw: new Date('2024-11-08'),
    updatedAt: '2 дня назад',
    updatedAtRaw: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tags: ['обучение', 'react'],
  },
];

const statusColors = {
  'Assigned': 'bg-gray-100 text-gray-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Done': 'bg-green-100 text-green-700',
};

type SortColumn = 'title' | 'status' | 'priority' | 'dueDate' | 'updatedAt';
type SortDirection = 'asc' | 'desc' | null;

type PersonalTaskTableProps = {
  filters: {
    status: string;
    priority: string;
    deadline: string;
  };
  onTaskClick: (taskId: string) => void;
};

export function PersonalTaskTable({ filters, onTaskClick }: PersonalTaskTableProps) {
  const [selectedTasks, setSelectedTasks] = React.useState<string[]>([]);
  const [sortColumn, setSortColumn] = React.useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null);

  const isOverdue = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const isToday = (dueDate: Date) => {
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  };

  const isThisWeek = (dueDate: Date) => {
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    return dueDate >= today && dueDate <= weekFromNow;
  };

  const isThisMonth = (dueDate: Date) => {
    const today = new Date();
    return dueDate.getMonth() === today.getMonth() && dueDate.getFullYear() === today.getFullYear();
  };

  const filteredAndSortedTasks = React.useMemo(() => {
    const filterTasks = (task: Task) => {
      // Фильтр по статусу
      if (filters.status !== 'all' && task.statusId !== filters.status) {
        return false;
      }

      // Фильтр по приоритету
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      // Фильтр по дедлайну
      if (filters.deadline !== 'all') {
        if (filters.deadline === 'overdue' && !isOverdue(task.dueDateRaw)) return false;
        if (filters.deadline === 'today' && !isToday(task.dueDateRaw)) return false;
        if (filters.deadline === 'week' && !isThisWeek(task.dueDateRaw)) return false;
        if (filters.deadline === 'month' && !isThisMonth(task.dueDateRaw)) return false;
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
  }, [filters, sortColumn, sortDirection]);

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
                onClick={() => handleSort('dueDate')}
              >
                Дедлайн
                <SortIcon column="dueDate" />
              </button>
            </TableHead>
            <TableHead>Теги</TableHead>
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
                  </div>
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
                  <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                    {task.dueDate}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap max-w-xs">
                    {task.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {task.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{task.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500">{task.updatedAt}</span>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onTaskClick(task.id)}>
                        Открыть
                      </DropdownMenuItem>
                      <DropdownMenuItem>Редактировать</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Удалить</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
