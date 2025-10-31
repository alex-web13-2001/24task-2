import React from 'react';
import { Archive, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

type ArchivedTask = {
  id: string;
  title: string;
  project: string;
  projectColor: string;
  completedDate: string;
  archivedDate: string;
};

const mockArchivedTasks: ArchivedTask[] = [
  {
    id: '1',
    title: 'Настройка сервера базы данных',
    project: 'Backend',
    projectColor: 'bg-green-500',
    completedDate: '25 окт 2024',
    archivedDate: '28 окт 2024',
  },
  {
    id: '2',
    title: 'Создание логотипа компании',
    project: 'Дизайн система',
    projectColor: 'bg-blue-500',
    completedDate: '20 окт 2024',
    archivedDate: '23 окт 2024',
  },
  {
    id: '3',
    title: 'Первичное тестирование API',
    project: 'Backend',
    projectColor: 'bg-green-500',
    completedDate: '18 окт 2024',
    archivedDate: '20 окт 2024',
  },
  {
    id: '4',
    title: 'Написание технического задания',
    project: 'Веб-сайт',
    projectColor: 'bg-purple-500',
    completedDate: '15 окт 2024',
    archivedDate: '17 окт 2024',
  },
  {
    id: '5',
    title: 'Настройка Git репозитория',
    project: 'DevOps',
    projectColor: 'bg-orange-500',
    completedDate: '12 окт 2024',
    archivedDate: '14 окт 2024',
  },
  {
    id: '6',
    title: 'Создание прототипа интерфейса',
    project: 'Дизайн система',
    projectColor: 'bg-blue-500',
    completedDate: '10 окт 2024',
    archivedDate: '12 окт 2024',
  },
];

export function ArchiveView() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredTasks = React.useMemo(() => {
    if (!searchQuery) return mockArchivedTasks;
    return mockArchivedTasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-gray-900 mb-1">Архив</h1>
            <p className="text-gray-600">Завершенные и архивированные задачи</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Поиск в архиве..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Archive className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">Архив пуст</h3>
            <p className="text-gray-600 max-w-md">
              Завершенные задачи будут отображаться здесь
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-3">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4>{task.title}</h4>
                        <Badge className={task.projectColor} variant="secondary">
                          {task.project}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Завершено: {task.completedDate}</span>
                        <span className="text-gray-400">•</span>
                        <span>Архивировано: {task.archivedDate}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Восстановить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
