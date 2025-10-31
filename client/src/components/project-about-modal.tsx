import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import {
  Link as LinkIcon,
  Paperclip,
  Users,
  CheckCircle2,
  AlertCircle,
  Download,
  Edit,
} from 'lucide-react';

type ProjectAboutModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onEdit?: () => void;
  onManageMembers?: () => void;
  currentUserRole?: 'owner' | 'collaborator' | 'member' | 'viewer';
};

// Mock project data
const getProjectData = (id: string) => ({
  id,
  name: 'Веб-сайт компании',
  color: 'bg-purple-500',
  description:
    'Разработка современного корпоративного веб-сайта с адаптивным дизайном и интеграцией с CRM системой. Проект включает создание дизайн-системы, разработку frontend и backend частей, а также настройку CI/CD процессов.',
  links: [
    { id: '1', name: 'Figma дизайн', url: 'https://figma.com/design' },
    { id: '2', name: 'GitHub репозиторий', url: 'https://github.com/project' },
    { id: '3', name: 'Документация', url: 'https://docs.project.com' },
  ],
  categories: ['Разработка', 'Дизайн', 'Тестирование'],
  attachments: [
    { id: '1', name: 'requirements.pdf', size: '2.4 MB', url: '#' },
    { id: '2', name: 'design-system.fig', size: '5.8 MB', url: '#' },
    { id: '3', name: 'technical-spec.docx', size: '1.2 MB', url: '#' },
  ],
  members: [
    { id: '1', name: 'Мария Иванова', short: 'МИ', role: 'Владелец' },
    { id: '2', name: 'Александр Петров', short: 'АП', role: 'Участник' },
    { id: '3', name: 'Евгений Смирнов', short: 'ЕС', role: 'Участник' },
    { id: '4', name: 'Дмитрий Козлов', short: 'ДК', role: 'Наблюдатель' },
  ],
  stats: {
    totalTasks: 24,
    overdueTasks: 2,
    activeMembers: 3,
  },
});

export function ProjectAboutModal({
  open,
  onOpenChange,
  projectId,
  onEdit,
  onManageMembers,
  currentUserRole = 'owner',
}: ProjectAboutModalProps) {
  const project = getProjectData(projectId);
  const isOwner = currentUserRole === 'owner';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full ${project.color}`} />
                <DialogTitle className="text-2xl">{project.name}</DialogTitle>
              </div>
              <DialogDescription>Подробная информация о проекте</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Описание */}
          <div>
            <h4 className="mb-2">Описание проекта</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
          </div>

          <Separator />

          {/* Внешние ссылки */}
          {project.links.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <LinkIcon className="w-4 h-4" />
                <h4>Внешние ссылки ({project.links.length})</h4>
              </div>
              <div className="space-y-2">
                {project.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <LinkIcon className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm">{link.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{link.url}</p>
                      </div>
                    </div>
                    <LinkIcon className="w-4 h-4 text-purple-600" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Категории */}
          {project.categories.length > 0 && (
            <div>
              <h4 className="mb-3">Категории</h4>
              <div className="flex flex-wrap gap-2">
                {project.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-sm">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Файлы */}
          {project.attachments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="w-4 h-4" />
                <h4>Файлы проекта ({project.attachments.length})</h4>
              </div>
              <div className="space-y-2">
                {project.attachments.map((attachment) => (
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

          {/* Участники */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4" />
              <h4>Участники проекта ({project.members.length})</h4>
            </div>
            <div className="space-y-2">
              {project.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-sm bg-purple-100 text-purple-600">
                        {member.short}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{member.role}</Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Статистика */}
          <div>
            <h4 className="mb-3">Статистика проекта</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl mb-1">{project.stats.totalTasks}</p>
                <p className="text-xs text-gray-600">Всего задач</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-2xl mb-1">{project.stats.overdueTasks}</p>
                <p className="text-xs text-gray-600">Просроченных</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl mb-1">{project.stats.activeMembers}</p>
                <p className="text-xs text-gray-600">Активных</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Кнопки действий */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Закрыть
            </Button>
            {isOwner && onManageMembers && (
              <Button
                onClick={() => {
                  onManageMembers();
                  onOpenChange(false);
                }}
                variant="outline"
                className="flex-1"
              >
                <Users className="w-4 h-4 mr-2" />
                Управление участниками
              </Button>
            )}
            {isOwner && (
              <Button
                onClick={() => {
                  onEdit?.();
                  onOpenChange(false);
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
