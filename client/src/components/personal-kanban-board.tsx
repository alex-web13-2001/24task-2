import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar, Flame, Plus, MoreHorizontal, X, Check, GripVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

type Task = {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
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
  canDelete?: boolean;
};

const initialColumns: Column[] = [
  {
    id: 'assigned',
    title: 'Assigned',
    color: 'bg-gray-500',
    canDelete: false,
    tasks: [
      {
        id: '1',
        title: 'Купить продукты на неделю',
        priority: 'medium',
        dueDate: '15 ноя',
        dueDateRaw: new Date('2024-11-15'),
        tags: ['покупки', 'дом'],
        status: 'assigned',
      },
      {
        id: '2',
        title: 'Записаться к врачу',
        priority: 'high',
        dueDate: '12 ноя',
        dueDateRaw: new Date('2024-11-12'),
        tags: ['здоровье', 'срочно'],
        status: 'assigned',
      },
      {
        id: '3',
        title: 'Подготовиться к презентации',
        priority: 'high',
        dueDate: '13 ноя',
        dueDateRaw: new Date('2024-11-13'),
        tags: ['работа', 'презентация'],
        status: 'assigned',
      },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: 'bg-blue-500',
    canDelete: false,
    tasks: [
      {
        id: '4',
        title: 'Изучить новый фреймворк',
        priority: 'medium',
        dueDate: '20 ноя',
        dueDateRaw: new Date('2024-11-20'),
        tags: ['обучение', 'разработка'],
        status: 'in-progress',
      },
      {
        id: '5',
        title: 'Организовать рабочий стол',
        priority: 'low',
        dueDate: '18 ноя',
        dueDateRaw: new Date('2024-11-18'),
        tags: ['организация', 'дом'],
        status: 'in-progress',
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    color: 'bg-green-500',
    canDelete: false,
    tasks: [
      {
        id: '6',
        title: 'Оплатить счета',
        priority: 'medium',
        dueDate: '10 ноя',
        dueDateRaw: new Date('2024-11-10'),
        tags: ['финансы'],
        status: 'done',
      },
      {
        id: '7',
        title: 'Прочитать статью по React',
        priority: 'low',
        dueDate: '8 ноя',
        dueDateRaw: new Date('2024-11-08'),
        tags: ['обучение', 'react'],
        status: 'done',
      },
    ],
  },
];

type PersonalKanbanBoardProps = {
  filters: {
    status: string;
    priority: string;
    deadline: string;
  };
  onTaskClick: (taskId: string) => void;
};

export function PersonalKanbanBoard({ filters, onTaskClick }: PersonalKanbanBoardProps) {
  const [columns, setColumns] = React.useState<Column[]>(initialColumns);
  const [isAddingColumn, setIsAddingColumn] = React.useState(false);
  const [newColumnName, setNewColumnName] = React.useState('');
  const [editingColumnId, setEditingColumnId] = React.useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = React.useState('');
  const [columnToDelete, setColumnToDelete] = React.useState<string | null>(null);

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

  const filteredColumns = React.useMemo(() => {
    const filterTasks = (task: Task) => {
      // Фильтр по статусу
      if (filters.status !== 'all' && task.status !== filters.status) {
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

    return columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter(filterTasks),
    }));
  }, [columns, filters]);

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      const newColumn: Column = {
        id: `custom-${Date.now()}`,
        title: newColumnName.trim(),
        color: 'bg-purple-500',
        canDelete: true,
        tasks: [],
      };
      setColumns([...columns, newColumn]);
      setNewColumnName('');
      setIsAddingColumn(false);
    }
  };

  const handleRenameColumn = (columnId: string) => {
    if (editingColumnName.trim()) {
      setColumns(columns.map(col =>
        col.id === columnId ? { ...col, title: editingColumnName.trim() } : col
      ));
      setEditingColumnId(null);
      setEditingColumnName('');
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (column && column.tasks.length === 0) {
      setColumns(columns.filter(col => col.id !== columnId));
      setColumnToDelete(null);
    }
  };

  const startEditColumn = (column: Column) => {
    setEditingColumnId(column.id);
    setEditingColumnName(column.title);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 p-4 md:p-6 h-full min-w-max">
          {filteredColumns.map((column) => (
            <div key={column.id} className="flex flex-col w-80 flex-shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                
                {editingColumnId === column.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editingColumnName}
                      onChange={(e) => setEditingColumnName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleRenameColumn(column.id)}
                      onBlur={() => handleRenameColumn(column.id)}
                      autoFocus
                      className="h-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRenameColumn(column.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-gray-900">{column.title}</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {column.tasks.length}
                    </Badge>
                  </>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => startEditColumn(column)}>
                      Переименовать
                    </DropdownMenuItem>
                    {column.canDelete && (
                      <DropdownMenuItem
                        onClick={() => setColumnToDelete(column.id)}
                        className="text-red-600"
                        disabled={column.tasks.length > 0}
                      >
                        Удалить
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto">
                {column.tasks.map((task) => {
                  const overdue = isOverdue(task.dueDateRaw);

                  return (
                    <Card
                      key={task.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onTaskClick(task.id)}
                    >
                      <CardHeader className="pb-3">
                        <h4>{task.title}</h4>
                      </CardHeader>
                      <CardContent className="pb-3 space-y-3">
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

                        {task.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {task.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className={`w-4 h-4 ${overdue ? 'text-red-600' : 'text-gray-500'}`} />
                          <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-500'}>{task.dueDate}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Кнопка добавления колонки */}
          <div className="w-80 flex-shrink-0">
            {isAddingColumn ? (
              <Card className="p-4">
                <Input
                  placeholder="Название колонки"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
                  autoFocus
                  className="mb-3"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddColumn}
                    disabled={!newColumnName.trim()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    Добавить
                  </Button>
                  <Button
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnName('');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Отмена
                  </Button>
                </div>
              </Card>
            ) : (
              <Button
                onClick={() => setIsAddingColumn(true)}
                variant="outline"
                className="w-full h-12 border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить колонку
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={!!columnToDelete} onOpenChange={() => setColumnToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить колонку?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эту колонку? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => columnToDelete && handleDeleteColumn(columnToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
