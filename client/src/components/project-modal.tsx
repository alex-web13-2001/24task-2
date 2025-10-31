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
import { X, Plus, Upload, Paperclip, Link as LinkIcon, Users, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

type ProjectModalMode = 'create' | 'edit';

type ProjectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ProjectModalMode;
  projectId?: string;
  onSave?: (project: any) => void;
  onManageMembers?: () => void;
};

const colorOptions = [
  { id: 'purple', color: 'bg-purple-500', label: 'Фиолетовый' },
  { id: 'green', color: 'bg-green-500', label: 'Зелёный' },
  { id: 'blue', color: 'bg-blue-500', label: 'Синий' },
  { id: 'pink', color: 'bg-pink-500', label: 'Розовый' },
  { id: 'orange', color: 'bg-orange-500', label: 'Оранжевый' },
  { id: 'red', color: 'bg-red-500', label: 'Красный' },
  { id: 'yellow', color: 'bg-yellow-500', label: 'Жёлтый' },
  { id: 'indigo', color: 'bg-indigo-500', label: 'Индиго' },
];

const mockCategories = [
  { id: 'development', name: 'Разработка' },
  { id: 'design', name: 'Дизайн' },
  { id: 'testing', name: 'Тестирование' },
  { id: 'documentation', name: 'Документация' },
  { id: 'bugs', name: 'Баги' },
  { id: 'marketing', name: 'Маркетинг' },
];

const mockTags = ['frontend', 'backend', 'mobile', 'web', 'api', 'ui/ux', 'devops'];

const getProjectData = (id: string) => ({
  id,
  name: 'Веб-сайт компании',
  description: 'Разработка корпоративного веб-сайта с современным дизайном',
  color: 'purple',
  links: [
    { id: '1', name: 'Figma дизайн', url: 'https://figma.com/design' },
    { id: '2', name: 'GitHub репозиторий', url: 'https://github.com/project' },
  ],
  categories: ['development', 'design'],
  tags: ['web', 'frontend'],
  attachments: [
    { id: '1', name: 'requirements.pdf', size: '2.4 MB' },
  ],
  members: [
    { id: '1', name: 'Мария Иванова', short: 'МИ', role: 'Владелец' },
    { id: '2', name: 'Александр Петров', short: 'АП', role: 'Участник' },
    { id: '3', name: 'Евгений Смирнов', short: 'ЕС', role: 'Участник' },
  ],
});

export function ProjectModal({
  open,
  onOpenChange,
  mode,
  projectId,
  onSave,
  onManageMembers,
}: ProjectModalProps) {
  const isEditMode = mode === 'edit';
  const existingProject = projectId && isEditMode ? getProjectData(projectId) : null;

  // Form state
  const [name, setName] = React.useState(existingProject?.name || '');
  const [description, setDescription] = React.useState(existingProject?.description || '');
  const [selectedColor, setSelectedColor] = React.useState(existingProject?.color || 'purple');
  const [links, setLinks] = React.useState<Array<{ id: string; name: string; url: string }>>(
    existingProject?.links || []
  );
  const [newLinkName, setNewLinkName] = React.useState('');
  const [newLinkUrl, setNewLinkUrl] = React.useState('');
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    existingProject?.categories || []
  );
  const [attachments, setAttachments] = React.useState<any[]>(existingProject?.attachments || []);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (existingProject) {
      setName(existingProject.name);
      setDescription(existingProject.description);
      setSelectedColor(existingProject.color);
      setLinks(existingProject.links);
      setSelectedCategories(existingProject.categories);
      setAttachments(existingProject.attachments);
    }
  }, [existingProject]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedColor('purple');
    setLinks([]);
    setNewLinkName('');
    setNewLinkUrl('');
    setSelectedCategories([]);
    setAttachments([]);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Название обязательно для заполнения';
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

    const projectData = {
      id: existingProject?.id || `project-${Date.now()}`,
      name,
      description,
      color: selectedColor,
      links,
      categories: selectedCategories,
      attachments,
    };

    onSave?.(projectData);

    if (isEditMode) {
      toast.success('Проект обновлён');
    } else {
      toast.success('Проект создан успешно');
    }

    onOpenChange(false);
    if (!isEditMode) resetForm();
  };

  const addLink = () => {
    if (newLinkName.trim() && newLinkUrl.trim()) {
      setLinks([
        ...links,
        {
          id: `link-${Date.now()}`,
          name: newLinkName.trim(),
          url: newLinkUrl.trim(),
        },
      ]);
      setNewLinkName('');
      setNewLinkUrl('');
    }
  };

  const removeLink = (linkId: string) => {
    setLinks(links.filter((link) => link.id !== linkId));
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Редактировать проект' : 'Создать новый проект'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Обновите информацию о проекте'
              : 'Заполните информацию о новом проекте. После создания автоматически создадутся три колонки: Assigned, In Progress, Done.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Название */}
          <div className="space-y-2">
            <Label htmlFor="project-name">
              Название проекта <span className="text-red-500">*</span>
            </Label>
            <Input
              id="project-name"
              placeholder="Введите название проекта"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <Label htmlFor="project-description">Описание</Label>
            <Textarea
              id="project-description"
              placeholder="Опишите проект подробнее"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Цвет */}
          <div className="space-y-2">
            <Label>Цвет проекта</Label>
            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedColor(option.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    selectedColor === option.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full ${option.color}`} />
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Внешние ссылки */}
          <div className="space-y-2">
            <Label>Внешние ссылки</Label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Название ссылки"
                  value={newLinkName}
                  onChange={(e) => setNewLinkName(e.target.value)}
                />
                <Input
                  placeholder="URL"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addLink}
                disabled={!newLinkName.trim() || !newLinkUrl.trim()}
                className="w-full"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить ссылку
              </Button>
            </div>

            {links.length > 0 && (
              <div className="space-y-2 mt-3">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <LinkIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{link.name}</p>
                        <p className="text-xs text-gray-500 truncate">{link.url}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLink(link.id)}
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

          {/* Категории */}
          <div className="space-y-2">
            <Label>Категории проекта</Label>
            <p className="text-xs text-gray-500">Выберите одну или несколько категорий</p>
            <div className="flex flex-wrap gap-2">
              {mockCategories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategories.includes(category.id) ? 'default' : 'outline'}
                  className={`cursor-pointer ${
                    selectedCategories.includes(category.id)
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => toggleCategory(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Файлы */}
          <div className="space-y-2">
            <Label>Файлы</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="project-file-upload"
              />
              <label htmlFor="project-file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Перетащите файлы сюда или нажмите для выбора
                </p>
                <p className="text-xs text-gray-500 mt-1">Документы, изображения, архивы</p>
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

          {isEditMode && existingProject?.members && (
            <>
              <Separator />

              {/* Участники проекта */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Участники проекта</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      {existingProject.members.length} участник(ов)
                    </p>
                  </div>
                  {onManageMembers && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onManageMembers();
                        onOpenChange(false);
                      }}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Управление участниками
                    </Button>
                  )}
                </div>

                {/* Компактный список участников */}
                <div className="space-y-2">
                  {existingProject.members.slice(0, 3).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                          {member.short}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  ))}
                  {existingProject.members.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      и ещё {existingProject.members.length - 3} участник(ов)
                    </p>
                  )}
                </div>

                {onManageMembers && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onManageMembers();
                      onOpenChange(false);
                    }}
                    className="w-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Пригласить участника
                  </Button>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Кнопки */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                if (!isEditMode) resetForm();
              }}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!name.trim()}
            >
              {isEditMode ? 'Сохранить изменения' : 'Создать проект'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
