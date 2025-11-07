# T24 Task Manager

Современный таск-менеджер с Kanban досками, системой управления проектами и собственным бэкендом на Node.js + PostgreSQL.

## 🚀 Особенности

- ✅ **Управление задачами** - создание, редактирование, удаление задач
- 📊 **Kanban доски** - визуализация рабочего процесса
- 👥 **Проекты и команды** - совместная работа над проектами
- 🔐 **Аутентификация** - безопасная система входа с JWT
- 📁 **Загрузка файлов** - прикрепление файлов к задачам
- 💬 **Комментарии** - обсуждение задач в команде
- 🎨 **Категории** - организация задач по категориям
- 📱 **Адаптивный дизайн** - работает на всех устройствах

## 🛠 Технологический стек

### Backend
- Node.js 22
- Express.js
- PostgreSQL 15
- Sequelize ORM
- JWT Authentication
- Multer (загрузка файлов)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- React DnD (Drag and Drop)

### DevOps
- Docker & Docker Compose
- Nginx
- PostgreSQL

## 📋 Требования

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 22+ (для локальной разработки)
- PostgreSQL 15+ (для локальной разработки)

## 🚀 Быстрый старт

### Запуск через Docker Compose (рекомендуется)

1. Клонируйте репозиторий:
```bash
git clone https://github.com/alex-web13-2001/24task-2.git
cd 24task-2
```

2. Создайте файлы окружения:
```bash
# Backend
cp server/.env.example server/.env

# Frontend
cp client/.env.example client/.env
```

3. Отредактируйте `server/.env` и измените `JWT_SECRET` на случайную строку:
```env
JWT_SECRET=your-super-secret-random-string-here
```

4. Запустите все сервисы:
```bash
docker-compose up -d
```

5. Откройте браузер:
- Frontend: http://localhost
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health

### Локальная разработка

#### Backend

1. Установите зависимости:
```bash
cd server
npm install
```

2. Создайте `.env` файл:
```bash
cp .env.example .env
```

3. Запустите PostgreSQL (через Docker):
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_DB=taskmanager \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

4. Запустите сервер:
```bash
npm run dev
```

#### Frontend

1. Установите зависимости:
```bash
cd client
npm install
```

2. Создайте `.env` файл:
```bash
cp .env.example .env
```

3. Запустите dev сервер:
```bash
npm run dev
```

4. Откройте http://localhost:5173

## 📚 API Документация

### Authentication

#### POST /api/auth/signup
Регистрация нового пользователя.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "Иван Иванов"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Иван Иванов"
  },
  "token": "jwt-token"
}
```

#### POST /api/auth/login
Вход в систему.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "token": "jwt-token"
}
```

#### GET /api/auth/me
Получить текущего пользователя (требует авторизации).

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Иван Иванов",
    "avatar_url": null
  }
}
```

### Tasks

#### GET /api/tasks
Получить все задачи пользователя.

#### POST /api/tasks
Создать новую задачу.

#### PUT /api/tasks/:id
Обновить задачу.

#### DELETE /api/tasks/:id
Удалить задачу.

#### POST /api/tasks/:id/comments
Добавить комментарий к задаче.

### Projects

#### GET /api/projects
Получить все проекты пользователя.

#### POST /api/projects
Создать новый проект.

#### PUT /api/projects/:id
Обновить проект.

#### DELETE /api/projects/:id
Удалить проект.

#### POST /api/projects/:id/members
Добавить участника в проект.

#### DELETE /api/projects/:id/members/:userId
Удалить участника из проекта.

## 🗄 База данных

Схема базы данных включает следующие таблицы:

- `users` - пользователи системы
- `projects` - проекты
- `project_members` - участники проектов
- `tasks` - задачи
- `categories` - категории задач
- `task_attachments` - вложения к задачам
- `task_comments` - комментарии к задачам

Подробная схема доступна в файле `ARCHITECTURE.md`.

## 🔐 Безопасность

- Пароли хешируются с использованием bcrypt
- JWT токены для аутентификации
- CORS настроен для разрешенных доменов
- Валидация входных данных
- Rate limiting для защиты от DDoS
- Helmet.js для HTTP заголовков безопасности

## 📦 Деплой на production

### Подготовка

1. Измените переменные окружения в `server/.env`:
```env
NODE_ENV=production
JWT_SECRET=очень-длинная-случайная-строка
DB_PASSWORD=надежный-пароль
```

2. Обновите `docker-compose.yml`:
- Измените пароли базы данных
- Настройте CORS_ORIGIN на ваш домен
- Настройте порты при необходимости

### Запуск на сервере

1. Установите Docker и Docker Compose на сервер

2. Клонируйте репозиторий:
```bash
git clone https://github.com/alex-web13-2001/24task-2.git
cd 24task-2
```

3. Настройте переменные окружения

4. Запустите:
```bash
docker-compose up -d
```

5. Настройте Nginx reverse proxy (опционально):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

6. Настройте SSL с Let's Encrypt:
```bash
sudo certbot --nginx -d yourdomain.com
```

## 🔧 Управление

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Остановка
```bash
docker-compose down
```

### Остановка с удалением данных
```bash
docker-compose down -v
```

### Перезапуск
```bash
docker-compose restart
```

### Обновление
```bash
git pull
docker-compose build
docker-compose up -d
```

## 📁 Структура проекта

```
24task-2/
├── server/              # Backend приложение
│   ├── src/
│   │   ├── config/     # Конфигурация
│   │   ├── models/     # Модели БД
│   │   ├── controllers/# Контроллеры
│   │   ├── routes/     # Роуты
│   │   ├── middleware/ # Middleware
│   │   └── index.js    # Точка входа
│   ├── uploads/        # Загруженные файлы
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
│
├── client/             # Frontend приложение
│   ├── src/
│   │   ├── components/ # React компоненты
│   │   ├── contexts/   # Context API
│   │   ├── utils/      # Утилиты
│   │   └── App.tsx
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── ARCHITECTURE.md
├── MIGRATION_PLAN.md
└── README.md
```

## 🤝 Вклад в проект

Мы приветствуем ваш вклад! Пожалуйста:

1. Форкните репозиторий
2. Создайте ветку для вашей функции (`git checkout -b feature/amazing-feature`)
3. Закоммитьте изменения (`git commit -m 'Add amazing feature'`)
4. Запушьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

## 📧 Контакты

- GitHub: [@alex-web13-2001](https://github.com/alex-web13-2001)
- Repository: [24task-2](https://github.com/alex-web13-2001/24task-2)

## 🙏 Благодарности

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Sequelize](https://sequelize.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
