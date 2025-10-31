import React from 'react';
import { User, Mail, Calendar, Lock, Bell, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';

export function ProfileView() {
  const [name, setName] = React.useState('Александр Петров');
  const [email, setEmail] = React.useState('alex@example.com');
  const [notifications, setNotifications] = React.useState(true);
  const [emailDigest, setEmailDigest] = React.useState(true);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="border-b bg-white px-6 py-4">
        <div>
          <h1 className="text-gray-900 mb-1">Профиль</h1>
          <p className="text-gray-600">Управление настройками аккаунта</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Личная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl bg-purple-100 text-purple-600">
                    АП
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Изменить фото
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG или GIF. Максимум 2MB
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">
                    <User className="w-4 h-4 inline mr-2" />
                    Полное имя
                  </Label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-joined">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Дата регистрации
                  </Label>
                  <Input
                    id="profile-joined"
                    value="15 сентября 2024"
                    disabled
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline">Отмена</Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Сохранить изменения
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Безопасность</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p>Пароль</p>
                    <p className="text-sm text-gray-500">
                      Последнее изменение: 2 недели назад
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Изменить пароль
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Уведомления</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <div>
                    <p>Push-уведомления</p>
                    <p className="text-sm text-gray-500">
                      Получать уведомления о новых задачах
                    </p>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p>Email дайджест</p>
                    <p className="text-sm text-gray-500">
                      Еженедельная сводка по задачам
                    </p>
                  </div>
                </div>
                <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Язык интерфейса
                </Label>
                <Input id="language" value="Русский" disabled />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Опасная зона</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p>Удалить аккаунт</p>
                  <p className="text-sm text-gray-500">
                    Это действие нельзя будет отменить
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Удалить аккаунт
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
