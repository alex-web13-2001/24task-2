import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Calendar,
  Flame,
  Tag,
  User,
  Paperclip,
  Clock,
  Trash2,
  X,
  Upload,
  Download,
  History,
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';
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

type TaskModalMode = 'create' | 'view' | 'edit';

type TaskModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: TaskModalMode;
  taskId?: string;
  initialProject?: string;
  onSave?: (task: any) => void;
  onDelete?: (taskId: string) => void;
};

// Mock data
const mockProjects = [
  { id: 'personal', name: 'Мои задачи', color: 'bg-gray-500' },
  { id: 'website', name: 'Веб-сайт', color: 'bg-purple-500' },
  { id: 'backend', name: 'Backend', color: 'bg-green-500' },
  { id: 'mobile', name: 'Мобильное приложение', color: 'bg-pink-500' },
  { id: 'devops', name: 'DevOps', color: 'bg-orange-500' },
  { id: 'design', name: 'Дизайн система', color: 'bg-blue-500' },
];

const mockCategories = [
  { id: 'none', name: 'Нет', color: 'bg-gray-400' },
  { id: 'development', name: 'Разработка', color: 'bg-purple-500' },
  { id: 'design', name: 'Дизайн', color: 'bg-pink-500' },
  { id: 'testing', name: 'Тестирование', color: 'bg-green-500' },
  { id: 'documentation', name: 'Документация', color: 'bg-blue-500' },
  { id: 'bugs', name: 'Баги', color: 'bg-red-500' },
];

const mockAssignees = [
  { id: 'ap', name: 'Александр Петров', short: 'АП' },
  { id: 'mi', name: 'Мария Иванова', short: 'МИ' },
  { id: 'es', name: 'Евгений Смирнов', short: 'ЕС' },
  { id: 'dk', name: 'Дмитрий Козлов', short: 'ДК' },
];

const mockTags = ['UI/UX', 'срочно', 'дизайн', 'frontend', 'backend', 'API', 'тестирование'];

const getTaskData = (id: string) => ({
  id,
  title: 'Разработать дизайн главной страницы',
  description:
    'Создать макеты главной страницы в Figma. Нужно учесть современные тренды дизайна и обеспечить удобство использования на различных устройствах.\n\nСсылки:\nhttps://figma.com/mockup\nhttps://dribbble.com/shots/inspiration',
  status: 'assigned',
  statusName: 'Назначено',
  priority: 'high',
  projectId: 'website',
  project: 'Веб-сайт',
  projectColor: 'bg-purple-500',
  categoryId: 'design',
  category: 'Дизайн',
  categoryColor: 'bg-pink-500',
  assigneeId: 'ap',
  assignee: 'Александр Петров',
  assigneeShort: 'АП',
  creatorId: 'mi',
  creator: 'Мария Иванова',
  creatorShort: 'МИ',
  dueDate: new Date('2024-11-15'),
  createdAt: '10 ноября 2024',
  updatedAt: '2 часа назад',
  tags: ['UI/UX', 'срочно', 'дизайн'],
  attachments: [
    { id: '1', name: 'mockup-v1.fig', size: '2.4 MB', url: '#' },
    { id: '2', name: 'requirements.pdf', size: '856 KB', url: '#' },
  ],
});

export function TaskModal({
  open,
  onOpenChange,
  mode: initialMode,
  taskId,
  initialProject,
  onSave,
  onDelete,
}: TaskModalProps) {
  const [mode, setMode] = React.useState<TaskModalMode>(initialMode);
  
  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';

  // Reset mode when modal closes/opens
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode, open]);

  // Загрузка данных задачи для режима просмотра/редактирования
  const existingTask = taskId && !isCreateMode ? getTaskData(taskId) : null;

  // Form state
  const [title, setTitle] = React.useState(existingTask?.title || '');
  const [description, setDescription] = React.useState(existingTask?.description || '');
  const [projectId, setProjectId] = React.useState(existingTask?.projectId || initialProject || '');
  const [categoryId, setCategoryId] = React.useState(existingTask?.categoryId || '');
  const [priority, setPriority] = React.useState(existingTask?.priority || 'medium');
  const [status, setStatus] = React.useState(existingTask?.status || 'assigned');
  const [assigneeId, setAssigneeId] = React.useState(existingTask?.assigneeId || '');
  const [dueDate, setDueDate] = React.useState<Date | undefined>(existingTask?.dueDate);
  const [tags, setTags] = React.useState<string[]>(existingTask?.tags || []);
  const [newTag, setNewTag] = React.useState('');
  const [attachments, setAttachments] = React.useState<any[]>(existingTask?.attachments || []);
  
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Update form when switching modes or task changes
  React.useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description);
      setProjectId(existingTask.projectId);
      setCategoryId(existingTask.categoryId);
      setPriority(existingTask.priority);
      setStatus(existingTask.status);
      setAssigneeId(existingTask.assigneeId);
      setDueDate(existingTask.dueDate);
      setTags(existingTask.tags);
      setAttachments(existingTask.attachments);
    } else if (isCreateMode) {
      setProjectId(initialProject || 'personal');
      setCategoryId('none');
    }
  }, [existingTask, isCreateMode, initialProject]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setProjectId(initialProject || 'personal');
    setCategoryId('none');
    setPriority('medium');
    setStatus('assigned');
    setAssigneeId('');
    setDueDate(undefined);
    setTags([]);
    setNewTag('');
    setAttachments([]);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Название обязательно для заполнения';
    }
    if (!projectId) {
      newErrors.project = 'Выберите проект';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Заполните обязательные поля');
      return;
    }

    const taskData = {
      id: existingTask?.id || `task-${Date.now()}`,
      title,
      description,
      projectId,
      categoryId,
      priority,
      status,
      assigneeId,
      dueDate,
      tags,
      attachments,
    };

    onSave?.(taskData);
    
    if (isCreateMode) {
      toast.success('Задача создана успешно');
      resetForm();
    } else {
      toast.success('Изменения сохранены');
    }
    
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (taskId) {
      onDelete?.(taskId);
      toast.success('Задача удалена');
      onOpenChange(false);
    }
    setShowDeleteDialog(false);
  };

  const addTag = (tag?: string) => {
    const tagToAdd = tag || newTag.trim();
    if (tagToAdd && !tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments = Array.from(files).map((file) => ({
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        url: URL.createObjectURL(file),
      }));
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter((a) => a.id !== attachmentId));
  };

  const renderDescription = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const selectedProject = mockProjects.find((p) => p.id === projectId);
  const selectedCategory = mockCategories.find((c) => c.id === categoryId);
  const selectedAssignee = mockAssignees.find((a) => a.id === assigneeId);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {!isViewMode && (
                  <DialogTitle>
                    {isCreateMode ? 'Создать новую задачу' : 'Редактировать задачу'}
                  </DialogTitle>
                )}
                {isViewMode && existingTask && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={existingTask.projectColor} variant="secondary">
                        {existingTask.project}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`${existingTask.categoryColor} text-white border-0`}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {existingTask.category}
                      </Badge>
                    </div>
                    <DialogTitle className="text-2xl">{existingTask.title}</DialogTitle>
                  </>
                )}
                <DialogDescription className="sr-only">
                  {isCreateMode && 'Создание новой задачи'}
                  {isEditMode && 'Редактирование задачи'}
                  {isViewMode && 'Просмотр задачи'}
                </DialogDescription>
              </div>
              {isEditMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* VIEW MODE */}
          {isViewMode && existingTask && (
            <div className="space-y-6 mt-4">
              {/* Основная информация */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Исполнитель:</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                          {existingTask.assigneeShort}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{existingTask.assignee}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Дедлайн:</span>
                    <span className="text-red-600">
                      {format(existingTask.dueDate, 'PPP', { locale: ru })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Flame className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Приоритет:</span>
                    <div className="flex items-center gap-1">
                      {existingTask.priority === 'urgent' && (
                        <Flame className="w-4 h-4 text-orange-600 fill-current" />
                      )}
                      {existingTask.priority === 'high' && (
                        <Flame className="w-4 h-4 text-red-600 fill-current" />
                      )}
                      <span>
                        {existingTask.priority === 'urgent' && 'Срочный🔥'}
                        {existingTask.priority === 'high' && 'Высокий'}
                        {existingTask.priority === 'medium' && 'Средний'}
                        {existingTask.priority === 'low' && 'Низкий'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Создатель:</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                          {existingTask.creatorShort}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{existingTask.creator}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Создано:</span>
                    <span className="text-sm">{existingTask.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Обновлено:</span>
                    <span className="text-sm">{existingTask.updatedAt}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Описание */}
              <div>
                <h4 className="mb-2">Описание</h4>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {renderDescription(existingTask.description)}
                </p>
              </div>

              {/* Теги */}
              {existingTask.tags.length > 0 && (
                <div>
                  <h4 className="mb-2">Теги</h4>
                  <div className="flex flex-wrap gap-2">
                    {existingTask.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Вложения */}
              {existingTask.attachments.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="w-4 h-4" />
                    <h4>Вложения ({existingTask.attachments.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {existingTask.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Paperclip className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm">{attachment.name}</p>
                            <p className="text-xs text-gray-500">{attachment.size}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Скачать
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Действия просмотра */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                  Закрыть
                </Button>
                <Button variant="outline" className="flex-1">
                  <History className="w-4 h-4 mr-2" />
                  История изменений
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => setMode('edit')}>
                  Редактировать
                </Button>
              </div>
            </div>
          )}

          {/* CREATE/EDIT MODE */}
          {!isViewMode && (
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">
                  Название задачи <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="task-title"
                  placeholder="Введите название задачи"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description">Описание</Label>
                <Textarea
                  id="task-description"
                  placeholder="Опишите задачу подробнее. Вы можете добавлять ссылки - они будут активными."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
                <p className="text-xs text-gray-500">
                  Ссылки будут автоматически распознаны и станут активными
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Проект <span className="text-red-500">*</span>
                  </Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger className={errors.project ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Выберите проект" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${project.color}`} />
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.project && <p className="text-xs text-red-600">{errors.project}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Категория</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${category.color}`} />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Приоритет</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Низкий (Low)</SelectItem>
                      <SelectItem value="medium">Средний (Medium)</SelectItem>
                      <SelectItem value="high">Высокий (High)</SelectItem>
                      <SelectItem value="urgent">Срочный🔥 (Urgent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assigned">Назначено (Assigned)</SelectItem>
                      <SelectItem value="in-progress">В работе (In Progress)</SelectItem>
                      <SelectItem value="review">На проверке (Review)</SelectItem>
                      <SelectItem value="done">Готово (Done)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Исполнитель</Label>
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите исполнителя" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAssignees.map((assignee) => (
                        <SelectItem key={assignee.id} value={assignee.id}>
                          {assignee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Дедлайн</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, 'PPP', { locale: ru }) : 'Выберите дату'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent mode="single" selected={dueDate} onSelect={setDueDate} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
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
                    list="tags-autocomplete"
                  />
                  <datalist id="tags-autocomplete">
                    {mockTags.map((tag) => (
                      <option key={tag} value={tag} />
                    ))}
                  </datalist>
                  <Button type="button" onClick={() => addTag()} size="sm">
                    Добавить
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
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

              <div className="space-y-2">
                <Label>Файлы</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Перетащите файлы сюда или нажмите для выбора
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Поддерживаются любые типы файлов</p>
                  </label>
                </div>
                {attachments.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Paperclip className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm">{attachment.name}</p>
                            <p className="text-xs text-gray-500">{attachment.size}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(attachment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    if (isCreateMode) resetForm();
                  }}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={!title.trim() || !projectId}
                >
                  {isCreateMode ? 'Создать задачу' : 'Сохранить изменения'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить задачу?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эту задачу? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить задачу
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
