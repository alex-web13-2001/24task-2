# 24Task API Documentation

Base URL: `http://localhost:5000/api` (development) или `https://yourdomain.com/api` (production)

## Аутентификация

Все защищенные endpoints требуют JWT токен в заголовке:

```
Authorization: Bearer <access_token>
```

### Регистрация

**POST** `/auth/register`

Регистрация нового пользователя.

**Request Body:**
```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "SecurePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Регистрация успешна. Проверьте ваш email для подтверждения аккаунта.",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "ivan@example.com"
  }
}
```

### Подтверждение Email

**POST** `/auth/verify-email`

Подтверждение email адреса после регистрации.

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email успешно подтвержден. Теперь вы можете войти в систему."
}
```

### Вход

**POST** `/auth/login`

Вход в систему.

**Request Body:**
```json
{
  "email": "ivan@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Вход выполнен успешно",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Иван Иванов",
      "email": "ivan@example.com",
      "avatar": null,
      "status": "active",
      "settings": {
        "language": "ru",
        "theme": "light",
        "notifications": {
          "email": true,
          "push": false
        }
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Обновление токена

**POST** `/auth/refresh-token`

Обновление access токена с помощью refresh токена.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### Выход

**POST** `/auth/logout` 🔒

Выход из системы (удаление refresh токена).

**Request Body:**
```json
{
  "refreshToken": "current_refresh_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Выход выполнен успешно"
}
```

### Восстановление пароля

**POST** `/auth/forgot-password`

Запрос на восстановление пароля.

**Request Body:**
```json
{
  "email": "ivan@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Если пользователь с таким email существует, письмо для восстановления пароля было отправлено"
}
```

### Сброс пароля

**POST** `/auth/reset-password`

Установка нового пароля.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Пароль успешно изменен"
}
```

### Текущий пользователь

**GET** `/auth/me` 🔒

Получение информации о текущем пользователе.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "avatar": null,
    "status": "active",
    "settings": {...}
  }
}
```

---

## Проекты

### Получение всех проектов

**GET** `/projects` 🔒

Получение списка проектов пользователя.

**Query Parameters:**
- `status` (optional): `active` | `archived`
- `type` (optional): `own` | `invited`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Проект Alpha",
      "description": "Описание проекта",
      "color": "#3B82F6",
      "status": "active",
      "ownerId": {...},
      "members": [...],
      "categories": [...],
      "columns": [...],
      "stats": {
        "totalTasks": 15,
        "overdueTasks": 2
      },
      "userRole": "Owner",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

### Получение проекта по ID

**GET** `/projects/:id` 🔒

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Проект Alpha",
    "description": "Описание проекта",
    "color": "#3B82F6",
    "links": [
      {
        "title": "GitHub",
        "url": "https://github.com/..."
      }
    ],
    "categories": [...],
    "tags": ["frontend", "backend"],
    "files": [...],
    "status": "active",
    "ownerId": {...},
    "members": [...],
    "columns": [
      {
        "_id": "...",
        "title": "Assigned",
        "order": 0,
        "isDefault": false
      },
      {
        "_id": "...",
        "title": "In Progress",
        "order": 1,
        "isDefault": false
      },
      {
        "_id": "...",
        "title": "Done",
        "order": 2,
        "isDefault": true
      }
    ],
    "stats": {
      "totalTasks": 15,
      "overdueTasks": 2
    },
    "userRole": "Owner",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

### Создание проекта

**POST** `/projects` 🔒

**Request Body:**
```json
{
  "title": "Новый проект",
  "description": "Описание проекта",
  "color": "#3B82F6",
  "links": [
    {
      "title": "GitHub",
      "url": "https://github.com/..."
    }
  ],
  "categories": ["category_id_1", "category_id_2"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Проект успешно создан",
  "data": {...}
}
```

### Обновление проекта

**PUT** `/projects/:id` 🔒

Требуется роль: Owner или Collaborator

**Request Body:**
```json
{
  "title": "Обновленное название",
  "description": "Новое описание",
  "color": "#10B981",
  "links": [...],
  "categories": [...],
  "tags": ["new-tag"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Проект успешно обновлен",
  "data": {...}
}
```

### Архивирование проекта

**POST** `/projects/:id/archive` 🔒

Требуется роль: Owner

**Response (200):**
```json
{
  "success": true,
  "message": "Проект успешно архивирован",
  "data": {...}
}
```

### Восстановление проекта

**POST** `/projects/:id/restore` 🔒

Требуется роль: Owner

**Response (200):**
```json
{
  "success": true,
  "message": "Проект успешно восстановлен",
  "data": {...}
}
```

### Удаление проекта

**DELETE** `/projects/:id` 🔒

Требуется роль: Owner

**Response (200):**
```json
{
  "success": true,
  "message": "Проект успешно удален"
}
```

### Обновление колонок

**PUT** `/projects/:id/columns` 🔒

Требуется роль: Owner или Collaborator

**Request Body:**
```json
{
  "columns": [
    {
      "title": "To Do",
      "order": 0,
      "isDefault": false
    },
    {
      "title": "In Progress",
      "order": 1,
      "isDefault": false
    },
    {
      "title": "Done",
      "order": 2,
      "isDefault": true
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Колонки успешно обновлены",
  "data": [...]
}
```

### Приглашение пользователя

**POST** `/projects/:id/invite` 🔒

Требуется роль: Owner

**Request Body:**
```json
{
  "email": "user@example.com",
  "role": "Collaborator"
}
```

Роли: `Collaborator`, `Member`, `Viewer`

**Response (201):**
```json
{
  "success": true,
  "message": "Приглашение успешно отправлено",
  "data": {
    "_id": "...",
    "email": "user@example.com",
    "projectId": "...",
    "role": "Collaborator",
    "token": "...",
    "status": "pending",
    "expiresAt": "..."
  }
}
```

### Удаление участника

**DELETE** `/projects/:id/members/:memberId` 🔒

Требуется роль: Owner

**Response (200):**
```json
{
  "success": true,
  "message": "Участник успешно удален из проекта"
}
```

### Изменение роли участника

**PUT** `/projects/:id/members/:memberId/role` 🔒

Требуется роль: Owner

**Request Body:**
```json
{
  "role": "Member"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Роль участника успешно обновлена",
  "data": {...}
}
```

---

## Задачи

### Получение всех задач

**GET** `/tasks` 🔒

**Query Parameters:**
- `projectId` (optional): ID проекта
- `status` (optional): статус задачи
- `priority` (optional): `Low` | `Medium` | `High` | `Urgent`
- `categoryId` (optional): ID категории
- `assignee` (optional): ID исполнителя
- `tags` (optional): массив тегов
- `archived` (optional): `true` | `false`
- `search` (optional): поисковый запрос
- `personal` (optional): `true` - только личные задачи

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Название задачи",
      "description": "Описание",
      "projectId": {...},
      "categoryId": {...},
      "tags": ["frontend", "bug"],
      "priority": "High",
      "status": "In Progress",
      "assignee": {...},
      "authorId": {...},
      "deadline": "2024-12-31T23:59:59.000Z",
      "files": [...],
      "archived": false,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### Получение задачи по ID

**GET** `/tasks/:id` 🔒

**Response (200):**
```json
{
  "success": true,
  "data": {...}
}
```

### Создание задачи

**POST** `/tasks` 🔒

**Request Body:**
```json
{
  "title": "Новая задача",
  "description": "Описание задачи",
  "projectId": "project_id или null для личной задачи",
  "categoryId": "category_id",
  "tags": ["tag1", "tag2"],
  "priority": "Medium",
  "status": "Assigned",
  "assignee": "user_id",
  "deadline": "2024-12-31T23:59:59.000Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Задача успешно создана",
  "data": {...}
}
```

### Обновление задачи

**PUT** `/tasks/:id` 🔒

**Request Body:**
```json
{
  "title": "Обновленное название",
  "description": "Новое описание",
  "categoryId": "new_category_id",
  "tags": ["new-tag"],
  "priority": "High",
  "status": "Done",
  "assignee": "new_assignee_id",
  "deadline": "2024-12-31T23:59:59.000Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Задача успешно обновлена",
  "data": {...}
}
```

### Удаление задачи

**DELETE** `/tasks/:id` 🔒

**Response (200):**
```json
{
  "success": true,
  "message": "Задача успешно удалена"
}
```

### История задачи

**GET** `/tasks/:id/history` 🔒

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "taskId": "...",
      "userId": {...},
      "type": "statusChange",
      "oldValue": "In Progress",
      "newValue": "Done",
      "createdAt": "..."
    }
  ]
}
```

Типы изменений: `created`, `statusChange`, `assigneeChange`, `edit`, `fileAdd`, `fileRemove`, `priorityChange`

---

## Категории

### Получение всех категорий

**GET** `/categories` 🔒

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Разработка",
      "color": "#3B82F6",
      "description": "Задачи разработки",
      "usageCount": 15,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### Создание категории

**POST** `/categories` 🔒

**Request Body:**
```json
{
  "title": "Новая категория",
  "color": "#10B981",
  "description": "Описание категории"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Категория успешно создана",
  "data": {...}
}
```

### Обновление категории

**PUT** `/categories/:id` 🔒

**Request Body:**
```json
{
  "title": "Обновленное название",
  "color": "#EF4444",
  "description": "Новое описание"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Категория успешно обновлена",
  "data": {...}
}
```

### Удаление категории

**DELETE** `/categories/:id` 🔒

**Response (200):**
```json
{
  "success": true,
  "message": "Категория успешно удалена"
}
```

---

## Приглашения

### Информация о приглашении

**GET** `/invitations/info/:token`

Публичный endpoint для получения информации о приглашении.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "project": {
      "_id": "...",
      "title": "Проект Alpha",
      "color": "#3B82F6",
      "description": "..."
    },
    "role": "Collaborator",
    "invitedBy": {
      "_id": "...",
      "name": "Иван Иванов",
      "email": "ivan@example.com"
    },
    "expiresAt": "..."
  }
}
```

### Принятие приглашения

**POST** `/invitations/accept` 🔒

**Request Body:**
```json
{
  "token": "invitation_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Вы успешно присоединились к проекту",
  "data": {
    "project": {...},
    "role": "Collaborator"
  }
}
```

### Отмена приглашения

**POST** `/invitations/:id/revoke` 🔒

Требуется роль: Owner проекта

**Response (200):**
```json
{
  "success": true,
  "message": "Приглашение успешно отменено"
}
```

### Приглашения проекта

**GET** `/invitations/project/:projectId` 🔒

Требуется роль: Owner проекта

**Response (200):**
```json
{
  "success": true,
  "data": [...]
}
```

---

## Пользователь

### Профиль

**GET** `/user/profile` 🔒

**Response (200):**
```json
{
  "success": true,
  "data": {...}
}
```

### Обновление профиля

**PUT** `/user/profile` 🔒

**Request Body:**
```json
{
  "name": "Новое имя",
  "avatar": "base64_string или URL"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Профиль успешно обновлен",
  "data": {...}
}
```

### Смена пароля

**POST** `/user/change-password` 🔒

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Пароль успешно изменен"
}
```

### Обновление настроек

**PUT** `/user/settings` 🔒

**Request Body:**
```json
{
  "language": "ru",
  "theme": "dark",
  "notifications": {
    "email": true,
    "push": false
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Настройки успешно обновлены",
  "data": {...}
}
```

### Удаление аккаунта

**DELETE** `/user/account` 🔒

**Response (200):**
```json
{
  "success": true,
  "message": "Аккаунт успешно удален"
}
```

---

## Коды ошибок

- `200` - Успешный запрос
- `201` - Ресурс создан
- `400` - Ошибка валидации или некорректный запрос
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

### Формат ошибки:

```json
{
  "success": false,
  "message": "Описание ошибки",
  "errors": [
    {
      "field": "email",
      "message": "Некорректный email"
    }
  ]
}
```

---

## Rate Limiting

API имеет ограничение: **100 запросов за 15 минут** с одного IP адреса.

При превышении лимита возвращается ошибка 429:

```json
{
  "success": false,
  "message": "Слишком много запросов с этого IP, попробуйте позже"
}
```

---

🔒 - Требуется аутентификация (JWT токен)
