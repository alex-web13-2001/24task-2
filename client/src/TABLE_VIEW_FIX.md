# Исправление табличного вида - проблема с отображением и скроллом

## Проблема
В табличном виде дашборда, личных задач и проектов задачи не отображались на экране, хотя в консоли были видны. Проблема заключалась в неправильной конфигурации flex-контейнеров.

## Причина
Компоненты таблиц (`TaskTable`, `PersonalTaskTable`) имеют корневой `div` с классом `flex-1`, который должен растягиваться на всё доступное пространство. Однако родительские контейнеры в следующих файлах не были настроены как flex-контейнеры:

- `/components/dashboard-view.tsx` (строка 585)
- `/components/tasks-view.tsx` (строка 222)
- `/components/project-detail-view.tsx` (строка 557)

Без `display: flex` на родителе, свойство `flex-1` на дочернем элементе не работает.

## Решение
Добавлен класс `flex flex-col` к родительским контейнерам:

### dashboard-view.tsx
```tsx
// Было:
<div className="flex-1 overflow-hidden">

// Стало:
<div className="flex-1 flex flex-col overflow-hidden">
```

### tasks-view.tsx
```tsx
// Было:
<div className="flex-1 overflow-hidden">

// Стало:
<div className="flex-1 flex flex-col overflow-hidden">
```

### project-detail-view.tsx
```tsx
// Было:
<div className="flex-1 overflow-hidden">

// Стало:
<div className="flex-1 flex flex-col overflow-hidden">
```

## Результат
Теперь таблицы корректно отображаются и занимают всё доступное пространство с вертикальным скроллом.

## Затронутые файлы
- `/components/dashboard-view.tsx` - исправлен контейнер для табличного вида
- `/components/tasks-view.tsx` - исправлен контейнер для табличного вида личных задач
- `/components/project-detail-view.tsx` - исправлен контейнер для табличного вида проектных задач

## Дата исправления
7 ноября 2025
