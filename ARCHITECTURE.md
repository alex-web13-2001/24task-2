# Архитектура проекта T24 Task Manager

## Обзор

Проект представляет собой полноценное веб-приложение для управления задачами с собственным бэкендом на Node.js + Express + PostgreSQL и фронтендом на React + Vite.

## Технологический стек

### Backend
- **Runtime:** Node.js 22.x
- **Framework:** Express.js
- **Database:** PostgreSQL 15+
- **ORM:** Sequelize
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer
- **Validation:** Joi
- **CORS:** cors middleware
- **Environment:** dotenv

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **UI Library:** Radix UI
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **HTTP Client:** Fetch API
- **Routing:** React Router (если потребуется)

### DevOps
- **Containerization:** Docker + Docker Compose
- **Web Server:** Nginx (для фронтенда)
- **Process Manager:** PM2 (опционально для production)

## Структура проекта

```
24task-2/
├── server/                 # Backend приложение
│   ├── src/
│   │   ├── config/        # Конфигурация (database, jwt)
│   │   ├── models/        # Sequelize модели
│   │   ├── controllers/   # Контроллеры API
│   │   ├── routes/        # Express роуты
│   │   ├── middleware/    # Middleware (auth, validation, error)
│   │   ├── services/      # Бизнес-логика
│   │   ├── utils/         # Утилиты
│   │   └── index.js       # Точка входа
│   ├── uploads/           # Загруженные файлы
│   ├── .env.example       # Пример переменных окружения
│   ├── package.json
│   └── Dockerfile
│
├── client/                # Frontend приложение
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── contexts/      # React Context
│   │   ├── utils/         # API клиент
│   │   ├── styles/        # CSS файлы
│   │   ├── App.tsx        # Главный компонент
│   │   └── main.tsx       # Точка входа
│   ├── public/            # Статические файлы
│   ├── .env.example       # Пример переменных окружения
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── docker-compose.yml     # Docker Compose конфигурация
├── .gitignore
├── README.md
└── DEPLOYMENT.md          # Инструкции по деплою

```

## База данных PostgreSQL

### Схема базы данных

#### Таблица: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Таблица: projects
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(50) DEFAULT 'purple',
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Таблица: project_members
```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'collaborator', 'viewer')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_id)
);
```

#### Таблица: categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  color VARCHAR(50),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Таблица: tasks
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'к выполнению',
  priority VARCHAR(50) DEFAULT 'средний',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  due_date DATE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Таблица: task_attachments
```sql
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  size INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Таблица: task_comments
```sql
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Таблица: project_invitations
```sql
CREATE TABLE project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('collaborator', 'viewer')),
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);
```

#### Таблица: custom_columns
```sql
CREATE TABLE custom_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'number', 'date', 'select')),
  options JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Таблица: task_custom_values
```sql
CREATE TABLE task_custom_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES custom_columns(id) ON DELETE CASCADE,
  value TEXT,
  UNIQUE(task_id, column_id)
);
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Получить текущего пользователя
- `PUT /api/auth/profile` - Обновить профиль
- `POST /api/auth/avatar` - Загрузить аватар
- `DELETE /api/auth/avatar` - Удалить аватар

### Tasks
- `GET /api/tasks` - Получить все задачи
- `POST /api/tasks` - Создать задачу
- `GET /api/tasks/:id` - Получить задачу
- `PUT /api/tasks/:id` - Обновить задачу
- `DELETE /api/tasks/:id` - Удалить задачу
- `POST /api/tasks/:id/comments` - Добавить комментарий
- `POST /api/tasks/:id/attachments` - Загрузить вложение
- `DELETE /api/tasks/:id/attachments/:attachmentId` - Удалить вложение

### Projects
- `GET /api/projects` - Получить все проекты
- `POST /api/projects` - Создать проект
- `GET /api/projects/:id` - Получить проект
- `PUT /api/projects/:id` - Обновить проект
- `DELETE /api/projects/:id` - Удалить проект
- `POST /api/projects/:id/members` - Добавить участника
- `DELETE /api/projects/:id/members/:userId` - Удалить участника
- `PUT /api/projects/:id/members/:userId` - Изменить роль участника

### Categories
- `GET /api/categories` - Получить все категории
- `POST /api/categories` - Создать категорию
- `PUT /api/categories/:id` - Обновить категорию
- `DELETE /api/categories/:id` - Удалить категорию

### Invitations
- `POST /api/invitations` - Создать приглашение
- `GET /api/invitations` - Получить приглашения
- `PUT /api/invitations/:id/accept` - Принять приглашение
- `PUT /api/invitations/:id/decline` - Отклонить приглашение

### Custom Columns
- `GET /api/projects/:id/columns` - Получить кастомные колонки проекта
- `POST /api/projects/:id/columns` - Создать кастомную колонку
- `PUT /api/columns/:id` - Обновить колонку
- `DELETE /api/columns/:id` - Удалить колонку

## Аутентификация и авторизация

### JWT токены
- Access Token: срок действия 24 часа
- Хранение: localStorage на клиенте
- Передача: Authorization Bearer header

### Middleware
- `authMiddleware` - проверка JWT токена
- `roleMiddleware` - проверка прав доступа к проекту

## Деплой на собственный сервер

### Требования к серверу
- Ubuntu 20.04+ или аналог
- Docker и Docker Compose
- Минимум 2GB RAM
- Минимум 20GB свободного места

### Процесс деплоя
1. Клонировать репозиторий
2. Настроить переменные окружения (.env файлы)
3. Запустить `docker-compose up -d`
4. Настроить Nginx для проксирования (опционально)
5. Настроить SSL сертификат (Let's Encrypt)

## Переменные окружения

### Server (.env)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@postgres:5432/taskmanager
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Client (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## Безопасность

- Пароли хешируются с использованием bcrypt (10 rounds)
- JWT токены подписываются секретным ключом
- CORS настроен для разрешенных доменов
- Валидация входных данных на всех endpoints
- Rate limiting для защиты от DDoS
- Helmet.js для HTTP заголовков безопасности
- SQL injection защита через Sequelize ORM

## Масштабирование

### Горизонтальное
- Несколько инстансов backend за load balancer
- Shared PostgreSQL database
- Shared file storage (S3 или NFS)

### Вертикальное
- Увеличение ресурсов сервера
- Оптимизация запросов к БД
- Кеширование (Redis)

## Мониторинг и логирование

- Winston для структурированного логирования
- PM2 для мониторинга процессов
- PostgreSQL логи
- Nginx access/error логи
