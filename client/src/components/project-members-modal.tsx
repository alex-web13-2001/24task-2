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
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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
import {
  Users,
  Mail,
  Trash2,
  Copy,
  Send,
  X,
  Search,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type Role = 'owner' | 'collaborator' | 'member' | 'viewer';

type Member = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  addedDate: string;
};

type Invitation = {
  id: string;
  email: string;
  role: Role;
  status: 'pending' | 'expired' | 'revoked' | 'accepted';
  sentDate: string;
  link?: string;
};

type ProjectMembersModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  projectColor: string;
  currentUserRole: Role;
};

const roleLabels: Record<Role, string> = {
  owner: 'Владелец',
  collaborator: 'Участник с правами',
  member: 'Участник',
  viewer: 'Наблюдатель',
};

const roleDescriptions: Record<Role, string> = {
  owner: 'Полный доступ ко всем функциям',
  collaborator: 'Может приглашать и видеть всех участников',
  member: 'Может менять статусы своих задач',
  viewer: 'Только просмотр',
};

const statusLabels: Record<Invitation['status'], string> = {
  pending: 'Ожидает',
  expired: 'Просрочено',
  revoked: 'Отозвано',
  accepted: 'Принято',
};

const statusColors: Record<Invitation['status'], string> = {
  pending: 'bg-blue-100 text-blue-700',
  expired: 'bg-gray-100 text-gray-700',
  revoked: 'bg-red-100 text-red-700',
  accepted: 'bg-green-100 text-green-700',
};

// Mock data
const getMockMembers = (): Member[] => [
  {
    id: '1',
    name: 'Мария Иванова',
    email: 'maria@example.com',
    avatar: 'МИ',
    role: 'owner',
    addedDate: '15.10.2024',
  },
  {
    id: '2',
    name: 'Александр Петров',
    email: 'alex@example.com',
    avatar: 'АП',
    role: 'collaborator',
    addedDate: '20.10.2024',
  },
  {
    id: '3',
    name: 'Евгений Смирнов',
    email: 'evgeny@example.com',
    avatar: 'ЕС',
    role: 'member',
    addedDate: '22.10.2024',
  },
  {
    id: '4',
    name: 'Дмитрий Козлов',
    email: 'dmitry@example.com',
    avatar: 'ДК',
    role: 'viewer',
    addedDate: '25.10.2024',
  },
];

const getMockInvitations = (): Invitation[] => [
  {
    id: '1',
    email: 'anna@example.com',
    role: 'member',
    status: 'pending',
    sentDate: '28.10.2024',
    link: 'https://24task.app/invite/abc123',
  },
  {
    id: '2',
    email: 'igor@example.com',
    role: 'viewer',
    status: 'expired',
    sentDate: '20.10.2024',
  },
];

export function ProjectMembersModal({
  open,
  onOpenChange,
  projectId,
  projectName,
  projectColor,
  currentUserRole,
}: ProjectMembersModalProps) {
  const [members, setMembers] = React.useState<Member[]>(getMockMembers());
  const [invitations, setInvitations] = React.useState<Invitation[]>(getMockInvitations());
  const [searchQuery, setSearchQuery] = React.useState('');
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<Role>('member');
  const [memberToDelete, setMemberToDelete] = React.useState<Member | null>(null);
  const [inviteToRevoke, setInviteToRevoke] = React.useState<Invitation | null>(null);
  const [activeTab, setActiveTab] = React.useState('members');

  const isOwner = currentUserRole === 'owner';
  const canManage = isOwner;

  const filteredMembers = React.useMemo(() => {
    if (!searchQuery) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error('Введите email');
      return;
    }

    // Проверка на уже существующего участника
    if (members.some((m) => m.email === inviteEmail)) {
      toast.error('Пользователь уже является участником проекта');
      return;
    }

    // Проверка на дубликат приглашения
    const existingInvite = invitations.find(
      (inv) => inv.email === inviteEmail && inv.status === 'pending'
    );

    if (existingInvite) {
      toast.error('Приглашение уже отправлено на этот email');
      return;
    }

    const newInvitation: Invitation = {
      id: `inv-${Date.now()}`,
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      sentDate: new Date().toLocaleDateString('ru-RU'),
      link: `https://24task.app/invite/${Math.random().toString(36).substr(2, 9)}`,
    };

    setInvitations([newInvitation, ...invitations]);
    setInviteEmail('');
    setInviteRole('member');
    toast.success('Приглашение отправлено');
    setActiveTab('invitations');
  };

  const handleCopyLink = (link?: string) => {
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success('Ссылка скопирована в буфер обмена');
    }
  };

  const handleResendInvite = (invitation: Invitation) => {
    const newLink = `https://24task.app/invite/${Math.random().toString(36).substr(2, 9)}`;
    setInvitations(
      invitations.map((inv) =>
        inv.id === invitation.id
          ? {
              ...inv,
              status: 'pending',
              sentDate: new Date().toLocaleDateString('ru-RU'),
              link: newLink,
            }
          : inv
      )
    );
    toast.success('Приглашение повторно отправлено');
  };

  const handleRevokeInvite = () => {
    if (!inviteToRevoke) return;

    setInvitations(
      invitations.map((inv) =>
        inv.id === inviteToRevoke.id ? { ...inv, status: 'revoked' } : inv
      )
    );
    toast.success('Приглашение отозвано');
    setInviteToRevoke(null);
  };

  const handleChangeRole = (memberId: string, newRole: Role) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    // Проверка: нельзя снять последнего владельца
    if (member.role === 'owner' && newRole !== 'owner') {
      const ownerCount = members.filter((m) => m.role === 'owner').length;
      if (ownerCount <= 1) {
        toast.error('Нельзя снять последнего владельца проекта');
        return;
      }
    }

    setMembers(
      members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    toast.success('Роль обновлена');
  };

  const handleDeleteMember = () => {
    if (!memberToDelete) return;

    // Проверка: нельзя удалить последнего владельца
    if (memberToDelete.role === 'owner') {
      const ownerCount = members.filter((m) => m.role === 'owner').length;
      if (ownerCount <= 1) {
        toast.error('Нельзя удалить последнего владельца проекта');
        setMemberToDelete(null);
        return;
      }
    }

    setMembers(members.filter((m) => m.id !== memberToDelete.id));
    toast.success('Участник удалён из проекта');
    setMemberToDelete(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle>Участники проекта</DialogTitle>
              <Badge className={`${projectColor} text-white`}>{projectName}</Badge>
            </div>
            <DialogDescription>
              Управление участниками и приглашениями проекта
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members">
                <Users className="w-4 h-4 mr-2" />
                Участники ({members.length})
              </TabsTrigger>
              <TabsTrigger value="invitations">
                <Mail className="w-4 h-4 mr-2" />
                Приглашения ({invitations.filter((i) => i.status === 'pending').length})
              </TabsTrigger>
            </TabsList>

            {/* Вкладка "Участники" */}
            <TabsContent value="members" className="space-y-4 mt-4">
              {/* Поиск */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Поиск по имени или email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Список участников */}
              <div className="space-y-2">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Участники не найдены</p>
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="truncate">{member.name}</p>
                        <p className="text-sm text-gray-500 truncate">{member.email}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right min-w-[200px]">
                          {canManage && member.role !== 'owner' ? (
                            <>
                              <Select
                                value={member.role}
                                onValueChange={(value) =>
                                  handleChangeRole(member.id, value as Role)
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="collaborator">
                                    {roleLabels.collaborator}
                                  </SelectItem>
                                  <SelectItem value="member">
                                    {roleLabels.member}
                                  </SelectItem>
                                  <SelectItem value="viewer">
                                    {roleLabels.viewer}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-gray-500 mt-1">
                                {roleDescriptions[member.role]}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Добавлен {member.addedDate}
                              </p>
                            </>
                          ) : (
                            <>
                              <Badge variant="outline" className="bg-purple-100 text-purple-700">
                                {roleLabels[member.role]}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                Добавлен {member.addedDate}
                              </p>
                            </>
                          )}
                        </div>

                        {canManage && member.role !== 'owner' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMemberToDelete(member)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Форма приглашения */}
              {canManage && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label>Пригласить нового участника</Label>
                    <div className="flex gap-3">
                      <Input
                        type="email"
                        placeholder="Email участника"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                        <SelectTrigger className="w-52">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="collaborator">
                            {roleLabels.collaborator}
                          </SelectItem>
                          <SelectItem value="member">{roleLabels.member}</SelectItem>
                          <SelectItem value="viewer">{roleLabels.viewer}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleInvite} className="bg-purple-600 hover:bg-purple-700">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Пригласить
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Вкладка "Приглашения" */}
            <TabsContent value="invitations" className="space-y-4 mt-4">
              {invitations.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 mb-4">Ожидающих приглашений нет</p>
                  {canManage && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-3">
                        <Label>Пригласить по email</Label>
                        <div className="flex gap-3">
                          <Input
                            type="email"
                            placeholder="Email участника"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="flex-1"
                          />
                          <Select
                            value={inviteRole}
                            onValueChange={(v) => setInviteRole(v as Role)}
                          >
                            <SelectTrigger className="w-52">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="collaborator">
                                {roleLabels.collaborator}
                              </SelectItem>
                              <SelectItem value="member">{roleLabels.member}</SelectItem>
                              <SelectItem value="viewer">{roleLabels.viewer}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={handleInvite}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Пригласить
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <Mail className="w-8 h-8 text-gray-400" />

                      <div className="flex-1 min-w-0">
                        <p className="truncate">{invitation.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {roleLabels[invitation.role]}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${statusColors[invitation.status]}`}>
                            {statusLabels[invitation.status]}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Отправлено {invitation.sentDate}
                        </p>
                      </div>

                      {canManage && (
                        <div className="flex items-center gap-2">
                          {invitation.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyLink(invitation.link)}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Скопировать
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setInviteToRevoke(invitation)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Отозвать
                              </Button>
                            </>
                          )}
                          {invitation.status === 'expired' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendInvite(invitation)}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Отправить снова
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Форма приглашения внизу */}
              {canManage && invitations.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label>Отправить новое приглашение</Label>
                    <div className="flex gap-3">
                      <Input
                        type="email"
                        placeholder="Email участника"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                        <SelectTrigger className="w-52">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="collaborator">
                            {roleLabels.collaborator}
                          </SelectItem>
                          <SelectItem value="member">{roleLabels.member}</SelectItem>
                          <SelectItem value="viewer">{roleLabels.viewer}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleInvite} className="bg-purple-600 hover:bg-purple-700">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Пригласить
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          <Separator className="mt-4" />

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления участника */}
      <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить участника?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить доступ для {memberToDelete?.name}? Этот
              пользователь сразу потер��ет доступ к проекту.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог подтверждения отзыва приглашения */}
      <AlertDialog open={!!inviteToRevoke} onOpenChange={() => setInviteToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Отозвать приглашение?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите отозвать приглашение для {inviteToRevoke?.email}? Ссылка
              приглашения станет недействительной.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeInvite}
              className="bg-red-600 hover:bg-red-700"
            >
              Отозвать
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
