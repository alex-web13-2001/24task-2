# План миграции с Supabase на собственный бэкенд

## Цель

Перевести проект Taskfront с использования Supabase (Backend-as-a-Service) на собственный бэкенд с PostgreSQL, который можно развернуть на любом сервере.

## Текущее состояние (Supabase)

### Используемые сервисы Supabase:
1. **Supabase Auth** - аутентификация пользователей
2. **Supabase Database** - PostgreSQL база данных
3. **Supabase Storage** - хранение файлов (аватары, вложения)
4. **Supabase Functions** - Edge Functions для API
5. **Realtime** - real-time обновления данных

### Архитектура:
- Фронтенд напрямую взаимодействует с Supabase через `@supabase/supabase-js`
- API реализован через Supabase Edge Functions (Deno)
- Аутентификация через Supabase Auth с JWT токенами
- Файлы хранятся в Supabase Storage

## Целевое состояние (Собственный бэкенд)

### Новая архитектура:
1. **Backend API** - Node.js + Express
2. **Database** - PostgreSQL (самостоятельный)
3. **File Storage** - Локальная файловая система или S3-совместимое хранилище
4. **Authentication** - JWT токены (собственная реализация)
5. **Real-time** (опционально) - WebSockets или Server-Sent Events

## Этапы миграции

### Этап 1: Создание структуры проекта ✅
- [x] Очистка репозитория 24task-2
- [x] Создание документации архитектуры
- [x] Планирование структуры директорий

### Этап 2: Разработка Backend API
- [ ] Настройка Express сервера
- [ ] Создание моделей Sequelize
- [ ] Реализация контроллеров
- [ ] Настройка middleware (auth, validation, error handling)
- [ ] Реализация роутов
- [ ] Настройка загрузки файлов (Multer)

### Этап 3: Миграция базы данных
- [ ] Создание SQL схемы
- [ ] Создание миграций Sequelize
- [ ] Настройка подключения к PostgreSQL
- [ ] Создание seed данных для тестирования

### Этап 4: Адаптация Frontend
- [ ] Копирование компонентов из Taskfront
- [ ] Замена Supabase клиента на Fetch API
- [ ] Обновление API методов
- [ ] Адаптация аутентификации
- [ ] Обновление загрузки файлов

### Этап 5: Тестирование
- [ ] Тестирование аутентификации
- [ ] Тестирование CRUD операций для задач
- [ ] Тестирование CRUD операций для проектов
- [ ] Тестирование загрузки файлов
- [ ] Тестирование прав доступа

### Этап 6: Подготовка к деплою
- [ ] Создание Dockerfile для backend
- [ ] Создание Dockerfile для frontend
- [ ] Настройка Docker Compose
- [ ] Создание документации по деплою
- [ ] Создание скриптов для развертывания

## Изменения в коде

### Backend (новый код)

#### 1. Аутентификация
**Было (Supabase):**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

**Станет (Express):**
```javascript
// POST /api/auth/login
const user = await User.findOne({ where: { email } });
const isValid = await bcrypt.compare(password, user.password_hash);
const token = jwt.sign({ userId: user.id }, JWT_SECRET);
```

#### 2. Получение данных
**Было (Supabase):**
```typescript
const response = await fetch(`${API_BASE_URL}/tasks`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Станет (Express):**
```javascript
// GET /api/tasks
router.get('/tasks', authMiddleware, async (req, res) => {
  const tasks = await Task.findAll({
    where: { 
      [Op.or]: [
        { created_by: req.user.id },
        { assignee_id: req.user.id }
      ]
    }
  });
  res.json({ success: true, tasks });
});
```

### Frontend (изменения)

#### 1. API клиент
**Было:**
```typescript
// src/utils/supabase/client.tsx
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(url, key);
```

**Станет:**
```typescript
// src/utils/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const apiClient = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      throw new Error(await response.text());
    }
    
    return response.json();
  }
};
```

#### 2. Методы аутентификации
**Было:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

**Станет:**
```typescript
const data = await apiClient.request('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
localStorage.setItem('token', data.token);
```

#### 3. Загрузка файлов
**Было:**
```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(path, file);
```

**Станет:**
```typescript
const formData = new FormData();
formData.append('avatar', file);

const data = await fetch(`${API_BASE_URL}/auth/avatar`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});
```

## Преимущества миграции

1. **Полный контроль** - вы владеете всем кодом и инфраструктурой
2. **Независимость** - нет зависимости от внешних сервисов
3. **Гибкость** - можно настроить под любые требования
4. **Экономия** - нет платы за Supabase при масштабировании
5. **Безопасность** - данные хранятся на вашем сервере
6. **Кастомизация** - полная свобода в реализации функционала

## Недостатки миграции

1. **Ответственность** - нужно самостоятельно поддерживать инфраструктуру
2. **Время разработки** - требуется больше времени на реализацию
3. **DevOps** - нужны навыки настройки серверов и баз данных
4. **Масштабирование** - нужно самостоятельно решать вопросы масштабирования
5. **Мониторинг** - нужно настраивать системы мониторинга

## Риски и их митигация

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Потеря данных при миграции | Низкая | Высокое | Резервное копирование, тестирование на dev окружении |
| Проблемы с производительностью | Средняя | Среднее | Оптимизация запросов, индексы БД, кеширование |
| Уязвимости безопасности | Средняя | Высокое | Аудит кода, использование проверенных библиотек, HTTPS |
| Сложности с деплоем | Низкая | Среднее | Подробная документация, Docker контейнеры |

## Временные затраты

- **Разработка Backend:** 2-3 дня
- **Адаптация Frontend:** 1-2 дня
- **Тестирование:** 1 день
- **Документация и деплой:** 1 день
- **Итого:** 5-7 дней

## Следующие шаги

1. ✅ Создать архитектуру проекта
2. ✅ Создать план миграции
3. ⏳ Реализовать Backend API
4. ⏳ Настроить базу данных PostgreSQL
5. ⏳ Адаптировать Frontend
6. ⏳ Протестировать систему
7. ⏳ Подготовить документацию по деплою
8. ⏳ Развернуть на сервере

## Контрольные точки

- [ ] Backend API работает и проходит тесты
- [ ] Frontend успешно взаимодействует с Backend
- [ ] Все функции из Taskfront работают
- [ ] Проект запускается через Docker Compose
- [ ] Документация по деплою готова
- [ ] Проект готов к развертыванию на production сервере
