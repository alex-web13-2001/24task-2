# Инструкция по развертыванию T24 Task Manager

Это подробное руководство по развертыванию приложения T24 Task Manager на вашем собственном сервере.

## Требования к серверу

### Минимальные требования
- **OS:** Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM:** 2GB (рекомендуется 4GB)
- **Disk:** 20GB свободного места
- **CPU:** 2 ядра (рекомендуется 4)
- **Network:** Публичный IP адрес

### Необходимое ПО
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Nginx (опционально, для reverse proxy)
- Certbot (опционально, для SSL)

## Установка Docker

### Ubuntu/Debian

```bash
# Обновление пакетов
sudo apt update && sudo apt upgrade -y

# Установка зависимостей
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Добавление GPG ключа Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавление репозитория Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Перелогиньтесь для применения изменений
```

### CentOS/RHEL

```bash
# Установка зависимостей
sudo yum install -y yum-utils

# Добавление репозитория Docker
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Установка Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Запуск Docker
sudo systemctl start docker
sudo systemctl enable docker

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER
```

### Проверка установки

```bash
docker --version
docker compose version
```

## Развертывание приложения

### Шаг 1: Клонирование репозитория

```bash
# Клонирование
git clone https://github.com/alex-web13-2001/24task-2.git
cd 24task-2
```

### Шаг 2: Настройка переменных окружения

#### Backend (.env)

```bash
cd server
cp .env.example .env
nano .env
```

Отредактируйте следующие переменные:

```env
NODE_ENV=production
PORT=3000

# Database - измените пароль!
DB_HOST=postgres
DB_PORT=5432
DB_NAME=taskmanager
DB_USER=postgres
DB_PASSWORD=ВАШ_НАДЕЖНЫЙ_ПАРОЛЬ

# JWT - ОБЯЗАТЕЛЬНО измените на случайную строку!
JWT_SECRET=сгенерируйте-длинную-случайную-строку-минимум-32-символа
JWT_EXPIRES_IN=24h

# CORS - укажите ваш домен
CORS_ORIGIN=https://yourdomain.com

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Генерация JWT_SECRET:**
```bash
# Linux/Mac
openssl rand -base64 32

# Или
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Frontend (.env)

```bash
cd ../client
cp .env.example .env
nano .env
```

```env
# Для production укажите ваш домен
VITE_API_URL=https://yourdomain.com/api
```

### Шаг 3: Настройка Docker Compose

```bash
cd ..
nano docker-compose.yml
```

Измените следующие параметры:

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ВАШ_НАДЕЖНЫЙ_ПАРОЛЬ  # Тот же что в .env

  backend:
    environment:
      DB_PASSWORD: ВАШ_НАДЕЖНЫЙ_ПАРОЛЬ  # Тот же что выше
      JWT_SECRET: ваш-jwt-secret-из-env
      CORS_ORIGIN: https://yourdomain.com
```

### Шаг 4: Запуск приложения

```bash
# Сборка и запуск всех сервисов
docker compose up -d --build

# Проверка статуса
docker compose ps

# Просмотр логов
docker compose logs -f
```

### Шаг 5: Проверка работоспособности

```bash
# Проверка backend
curl http://localhost:3000/health

# Проверка frontend
curl http://localhost
```

## Настройка Nginx Reverse Proxy

### Установка Nginx

```bash
sudo apt install -y nginx
```

### Конфигурация

Создайте файл конфигурации:

```bash
sudo nano /etc/nginx/sites-available/t24-task-manager
```

Добавьте следующую конфигурацию:

```nginx
# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Для Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (будут созданы Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (если потребуется)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:3000/uploads;
        proxy_set_header Host $host;
        
        # Кеширование статики
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Limits
    client_max_body_size 10M;
}
```

### Активация конфигурации

```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/t24-task-manager /etc/nginx/sites-enabled/

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

## Настройка SSL с Let's Encrypt

### Установка Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Получение сертификата

```bash
# Остановите Nginx временно
sudo systemctl stop nginx

# Получите сертификат
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Запустите Nginx
sudo systemctl start nginx
```

### Автоматическое обновление

Certbot автоматически настроит cron job для обновления сертификатов. Проверьте:

```bash
sudo certbot renew --dry-run
```

## Настройка Firewall

### UFW (Ubuntu)

```bash
# Разрешить SSH
sudo ufw allow 22/tcp

# Разрешить HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включить firewall
sudo ufw enable

# Проверить статус
sudo ufw status
```

### FirewallD (CentOS)

```bash
# Разрешить HTTP и HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Перезагрузить firewall
sudo firewall-cmd --reload
```

## Резервное копирование

### Скрипт для бэкапа базы данных

Создайте файл `/home/ubuntu/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="t24-postgres"

# Создать директорию для бэкапов
mkdir -p $BACKUP_DIR

# Создать бэкап
docker exec $CONTAINER_NAME pg_dump -U postgres taskmanager > $BACKUP_DIR/backup_$DATE.sql

# Удалить бэкапы старше 7 дней
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql"
```

Сделайте скрипт исполняемым:

```bash
chmod +x /home/ubuntu/backup.sh
```

### Настройка автоматического бэкапа

```bash
# Открыть crontab
crontab -e

# Добавить задачу (каждый день в 2:00 AM)
0 2 * * * /home/ubuntu/backup.sh >> /home/ubuntu/backup.log 2>&1
```

### Восстановление из бэкапа

```bash
# Восстановить базу данных
docker exec -i t24-postgres psql -U postgres taskmanager < /home/ubuntu/backups/backup_20231107_020000.sql
```

## Мониторинг

### Просмотр логов

```bash
# Все сервисы
docker compose logs -f

# Только backend
docker compose logs -f backend

# Только frontend
docker compose logs -f frontend

# Только база данных
docker compose logs -f postgres

# Последние 100 строк
docker compose logs --tail=100
```

### Проверка статуса

```bash
# Статус контейнеров
docker compose ps

# Использование ресурсов
docker stats

# Проверка здоровья
curl https://yourdomain.com/health
```

## Обновление приложения

```bash
# Перейти в директорию проекта
cd /home/ubuntu/24task-2

# Получить последние изменения
git pull

# Пересобрать и перезапустить
docker compose down
docker compose up -d --build

# Проверить логи
docker compose logs -f
```

## Решение проблем

### Контейнеры не запускаются

```bash
# Проверить логи
docker compose logs

# Проверить конфигурацию
docker compose config

# Пересоздать контейнеры
docker compose down -v
docker compose up -d --build
```

### База данных не подключается

```bash
# Проверить статус PostgreSQL
docker compose exec postgres pg_isready -U postgres

# Проверить логи PostgreSQL
docker compose logs postgres

# Подключиться к базе данных
docker compose exec postgres psql -U postgres -d taskmanager
```

### Backend возвращает ошибки

```bash
# Проверить логи backend
docker compose logs backend

# Проверить переменные окружения
docker compose exec backend env | grep DB_

# Перезапустить backend
docker compose restart backend
```

### Frontend не загружается

```bash
# Проверить логи frontend
docker compose logs frontend

# Проверить Nginx внутри контейнера
docker compose exec frontend nginx -t

# Перезапустить frontend
docker compose restart frontend
```

## Производительность

### Оптимизация PostgreSQL

Отредактируйте `docker-compose.yml`:

```yaml
postgres:
  command:
    - "postgres"
    - "-c"
    - "max_connections=200"
    - "-c"
    - "shared_buffers=256MB"
    - "-c"
    - "effective_cache_size=1GB"
    - "-c"
    - "work_mem=4MB"
```

### Масштабирование

Для горизонтального масштабирования:

```bash
# Запустить несколько инстансов backend
docker compose up -d --scale backend=3
```

Настройте Nginx как load balancer:

```nginx
upstream backend {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

location /api {
    proxy_pass http://backend;
}
```

## Безопасность

### Рекомендации

1. **Измените все пароли по умолчанию**
2. **Используйте сильный JWT_SECRET** (минимум 32 символа)
3. **Включите HTTPS** (Let's Encrypt)
4. **Настройте firewall** (UFW/FirewallD)
5. **Регулярно обновляйте систему** (`apt update && apt upgrade`)
6. **Настройте автоматические бэкапы**
7. **Ограничьте SSH доступ** (только по ключам)
8. **Используйте fail2ban** для защиты от брутфорса
9. **Мониторьте логи** на подозрительную активность
10. **Регулярно обновляйте Docker образы**

### Установка fail2ban

```bash
sudo apt install -y fail2ban

# Создать конфигурацию
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
```

```bash
# Запустить fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Поддержка

Если у вас возникли проблемы:

1. Проверьте логи: `docker compose logs`
2. Проверьте документацию: `README.md`, `ARCHITECTURE.md`
3. Создайте issue на GitHub: https://github.com/alex-web13-2001/24task-2/issues

## Контрольный список деплоя

- [ ] Docker и Docker Compose установлены
- [ ] Репозиторий клонирован
- [ ] Переменные окружения настроены (.env файлы)
- [ ] JWT_SECRET изменен на случайную строку
- [ ] Пароли базы данных изменены
- [ ] CORS_ORIGIN настроен на ваш домен
- [ ] Docker Compose запущен (`docker compose up -d`)
- [ ] Nginx установлен и настроен
- [ ] SSL сертификат получен (Let's Encrypt)
- [ ] Firewall настроен
- [ ] Автоматические бэкапы настроены
- [ ] Мониторинг настроен
- [ ] Приложение доступно по HTTPS
- [ ] Все функции протестированы

Поздравляем! Ваше приложение T24 Task Manager успешно развернуто! 🎉
