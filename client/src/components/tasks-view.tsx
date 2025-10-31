import React from 'react';
import { LayoutGrid, Table as TableIcon, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TaskModal } from './task-modal';
import { PersonalKanbanBoard } from './personal-kanban-board';
import { PersonalTaskTable } from './personal-task-table';

export function TasksView() {
  const [viewMode, setViewMode] = React.useState<'kanban' | 'table'>('kanban');
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  
  // Фильтры согласно ТЗ: статус, приоритет, дедлайн
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all');
  const [deadlineFilter, setDeadlineFilter] = React.useState<string>('all');

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const filters = {
    status: statusFilter,
    priority: priorityFilter,
    deadline: deadlineFilter,
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Заголовок и фильтры */}
      <div className="border-b bg-white px-4 md:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-gray-900 mb-1">Личные задачи</h1>
            <p className="text-gray-600 text-sm">Приватная доска для планирования личных дел</p>
          </div>
          
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
        </div>

        {/* Фильтры */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-600">Статус:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
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
                <SelectItem value="high">Высокий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="low">Низкий</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-600">Дедлайн:</Label>
            <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="overdue">Просрочено</SelectItem>
                <SelectItem value="today">Сегодня</SelectItem>
                <SelectItem value="week">На этой неделе</SelectItem>
                <SelectItem value="month">В этом месяце</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(statusFilter !== 'all' || priorityFilter !== 'all' || deadlineFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setDeadlineFilter('all');
              }}
            >
              Сбросить
            </Button>
          )}
        </div>
      </div>

      {/* Основная область */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <PersonalKanbanBoard filters={filters} onTaskClick={handleTaskClick} />
        ) : (
          <PersonalTaskTable filters={filters} onTaskClick={handleTaskClick} />
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
