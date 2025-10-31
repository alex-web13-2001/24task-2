import React from 'react';
import { Plus, MoreHorizontal, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

type Category = {
  id: string;
  name: string;
  color: string;
  taskCount: number;
  description: string;
};

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Разработка',
    color: 'bg-purple-500',
    taskCount: 24,
    description: 'Задачи по программированию и разработке',
  },
  {
    id: '2',
    name: 'Дизайн',
    color: 'bg-pink-500',
    taskCount: 12,
    description: 'Графический дизайн и UI/UX',
  },
  {
    id: '3',
    name: 'Тестирование',
    color: 'bg-green-500',
    taskCount: 8,
    description: 'QA и тестирование функционала',
  },
  {
    id: '4',
    name: 'Документация',
    color: 'bg-blue-500',
    taskCount: 15,
    description: 'Написание технической документации',
  },
  {
    id: '5',
    name: 'Встречи',
    color: 'bg-orange-500',
    taskCount: 6,
    description: 'Планирование встреч и созвонов',
  },
  {
    id: '6',
    name: 'Баги',
    color: 'bg-red-500',
    taskCount: 18,
    description: 'Исправление ошибок и багов',
  },
  {
    id: '7',
    name: 'Оптимизация',
    color: 'bg-yellow-500',
    taskCount: 9,
    description: 'Улучшение производительности',
  },
  {
    id: '8',
    name: 'Маркетинг',
    color: 'bg-indigo-500',
    taskCount: 11,
    description: 'Маркетинговые активности',
  },
];

export function CategoriesView() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [newCategoryDescription, setNewCategoryDescription] = React.useState('');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateOpen(false);
    setNewCategoryName('');
    setNewCategoryDescription('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-1">Категории</h1>
            <p className="text-gray-600">Управление категориями задач</p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать категорию
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center mb-3`}>
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                <h4>{category.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Задач:</span>
                  <Badge variant="secondary" className={category.color}>
                    {category.taskCount}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать категорию</DialogTitle>
            <DialogDescription>
              Добавьте новую категорию для группировки задач
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Название категории</Label>
              <Input
                id="category-name"
                placeholder="Введите название"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Описание</Label>
              <Input
                id="category-description"
                placeholder="Краткое описание"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Цвет</Label>
              <div className="flex gap-2">
                {['bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-blue-500', 'bg-orange-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 ${color} rounded-md border-2 border-transparent hover:border-gray-400 transition-colors`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                Создать
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
