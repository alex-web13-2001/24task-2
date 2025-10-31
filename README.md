# 24Task - Система управления задачами и проектами

Полнофункциональный таск-менеджер с поддержкой проектов, Kanban-досок, ролевой модели и real-time обновлений.

## 🚀 Технологический стек

### Backend
- **Node.js** (v22+) - серверная платформа
- **Express.js** - веб-фреймворк
- **MongoDB** - база данных
- **Mongoose** - ODM для MongoDB
- **JWT** - аутентификация (access + refresh tokens)
- **Socket.IO** - real-time обновления
- **Nodemailer** - отправка email уведомлений
- **Bcrypt** - хеширование паролей
- **Multer** - загрузка файлов

### Frontend
- **React** 18.3+ - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик и dev-сервер
- **React Router** - маршрутизация
- **Zustand** - управление состоянием
- **Axios** - HTTP клиент
- **Socket.IO Client** - real-time подключение
- **Tailwind CSS** - стилизация
- **Radix UI** - компоненты UI
- **Lucide React** - иконки

## 📋 Основные возможности

### Управление проектами
- ✅ Создание, редактирование и архивирование проектов
- ✅ Настраиваемые Kanban-доски с drag-and-drop
- ✅ Система ролей (Owner, Collaborator, Member, Viewer)
- ✅ Приглашение пользователей по email
- ✅ Хранение ссылок и файлов проекта
- ✅ Цветовая маркировка проектов

### Управление задачами
- ✅ Создание задач в проектах и личных задач
- ✅ Приоритеты (Low, Medium, High, Urgent)
- ✅ Категории и теги
- ✅ Назначение исполнителей
- ✅ Дедлайны и отслеживание просроченных задач
- ✅ История изменений задач
- ✅ Прикрепление файлов

### Пользовательский интерфейс
- ✅ Дашборд с общей статистикой
- ✅ Kanban и табличное отображение задач
- ✅ Фильтры и поиск
- ✅ Справочник категорий
- ✅ Архив проектов и задач
- ✅ Профиль пользователя с настройками
- ✅ Полная адаптивность (desktop/tablet/mobile)

### Безопасность
- ✅ JWT аутентификация с refresh токенами
- ✅ Подтверждение email при регистрации
- ✅ Восстановление пароля
- ✅ Хеширование паролей (bcrypt, 10+ rounds)
- ✅ Rate limiting
- ✅ Защита заголовков (Helmet)
- ✅ CORS настройки

## 🛠️ Установка и запуск

### Требования
- Node.js 22+
- MongoDB 7.0+
- npm или yarn

### Быстрый старт с Docker

```bash
# Клонирование репозитория
git clone https://github.com/alex-web13-2001/24task-2.git
cd 24task-2

# Запуск всех сервисов
docker-compose up -d

# Приложение будет доступно:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
```

### Ручная установка

#### 1. Backend

```bash
cd server

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env файл

# Запуск в режиме разработки
npm run dev

# Запуск в production
npm start
```

#### 2. Frontend

```bash
cd client

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env файл

# Запуск в режиме разработки
npm run dev

# Сборка для production
npm run build
```

## 📁 Структура проекта

```
24task-2/
├── server/                 # Backend приложение
│   ├── src/
│   │   ├── models/        # Mongoose модели
│   │   ├── controllers/   # Контроллеры API
│   │   ├── routes/        # Маршруты Express
│   │   ├── middleware/    # Middleware функции
│   │   ├── utils/         # Утилиты (JWT, Email)
│   │   ├── config/        # Конфигурация (БД)
│   │   └── server.js      # Точка входа
│   ├── uploads/           # Загруженные файлы
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── client/                # Frontend приложение
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── api/          # API клиенты
│   │   ├── store/        # Zustand stores
│   │   ├── hooks/        # Custom hooks
│   │   ├── utils/        # Утилиты
│   │   ├── styles/       # Глобальные стили
│   │   ├── App.tsx       # Главный компонент
│   │   └── main.tsx      # Точка входа
│   ├── package.json
│   ├── .env.example
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml     # Docker Compose конфигурация
└── README.md             # Документация
```

## 🔧 Конфигурация

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/24task
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-password
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 📡 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/verify-email` - Подтверждение email
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход
- `POST /api/auth/refresh-token` - Обновление токена
- `POST /api/auth/forgot-password` - Восстановление пароля
- `POST /api/auth/reset-password` - Сброс пароля
- `GET /api/auth/me` - Текущий пользователь

### Проекты
- `GET /api/projects` - Список проектов
- `POST /api/projects` - Создание проекта
- `GET /api/projects/:id` - Получение проекта
- `PUT /api/projects/:id` - Обновление проекта
- `DELETE /api/projects/:id` - Удаление проекта
- `POST /api/projects/:id/archive` - Архивирование
- `POST /api/projects/:id/restore` - Восстановление
- `POST /api/projects/:id/invite` - Приглашение пользователя
- `DELETE /api/projects/:id/members/:memberId` - Удаление участника

### Задачи
- `GET /api/tasks` - Список задач
- `POST /api/tasks` - Создание задачи
- `GET /api/tasks/:id` - Получение задачи
- `PUT /api/tasks/:id` - Обновление задачи
- `DELETE /api/tasks/:id` - Удаление задачи
- `GET /api/tasks/:id/history` - История задачи

### Категории
- `GET /api/categories` - Список категорий
- `POST /api/categories` - Создание категории
- `GET /api/categories/:id` - Получение категории
- `PUT /api/categories/:id` - Обновление категории
- `DELETE /api/categories/:id` - Удаление категории

### Пользователь
- `GET /api/user/profile` - Профиль
- `PUT /api/user/profile` - Обновление профиля
- `POST /api/user/change-password` - Смена пароля
- `PUT /api/user/settings` - Обновление настроек

## 🎯 Система ролей

| Действие | Owner | Collaborator | Member | Viewer |
|----------|-------|--------------|--------|--------|
| Просмотр проекта | ✔ | ✔ | ✔ | ✔ |
| Редактирование проекта | ✔ | ✔ | ✖ | ✖ |
| Создание задач | ✔ | ✔ | ✔ (только свои) | ✖ |
| Изменение чужих задач | ✔ | ✔ | ✖ | ✖ |
| Приглашения в проект | ✔ | ✖ | ✖ | ✖ |
| Архивация проекта | ✔ | ✖ | ✖ | ✖ |

## 🚀 Развертывание на сервере

### Nginx конфигурация

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 для production

```bash
# Установка PM2
npm install -g pm2

# Запуск backend
cd server
pm2 start src/server.js --name 24task-server

# Запуск frontend (после сборки)
cd client
npm run build
pm2 serve dist 3000 --name 24task-client --spa

# Сохранение конфигурации
pm2 save
pm2 startup
```

## 📝 Лицензия

MIT

## 👥 Автор

Разработано согласно техническому заданию для проекта 24Task.

## 🐛 Поддержка

При возникновении проблем создайте Issue в репозитории.
