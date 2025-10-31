# Инструкция по развертыванию 24Task на сервере

## Предварительные требования

- Сервер с Ubuntu 20.04+ или другой Linux дистрибутив
- Node.js 22+ установлен
- MongoDB 7.0+ установлен (или доступ к MongoDB Atlas)
- Nginx установлен
- Доменное имя настроено на ваш сервер
- SSL сертификат (рекомендуется Let's Encrypt)

## Шаг 1: Клонирование репозитория

```bash
# Подключитесь к серверу по SSH
ssh user@your-server.com

# Клонируйте репозиторий
cd /var/www
git clone https://github.com/alex-web13-2001/24task-2.git
cd 24task-2
```

## Шаг 2: Настройка Backend

```bash
cd server

# Установка зависимостей
npm install --production

# Создание .env файла
cp .env.example .env
nano .env
```

### Настройка .env файла:

```env
NODE_ENV=production
PORT=5000

# MongoDB - используйте ваши реальные данные
MONGODB_URI=mongodb://localhost:27017/24task
# Или MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/24task

# JWT - ОБЯЗАТЕЛЬНО смените на случайную строку!
JWT_SECRET=ваш-очень-секретный-ключ-минимум-32-символа
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email - настройте SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=24Task <noreply@yourdomain.com>

# Frontend URL - ваш домен
FRONTEND_URL=https://yourdomain.com

# CORS - ваш домен
CORS_ORIGIN=https://yourdomain.com

# Файлы
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
```

### Генерация секретного ключа JWT:

```bash
# Генерация случайного ключа
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Шаг 3: Настройка Frontend

```bash
cd ../client

# Установка зависимостей
npm install

# Создание .env файла
cp .env.example .env
nano .env
```

### Настройка .env файла:

```env
VITE_API_URL=https://yourdomain.com/api
VITE_SOCKET_URL=https://yourdomain.com
```

### Сборка frontend:

```bash
npm run build
```

## Шаг 4: Установка PM2 для управления процессами

```bash
# Установка PM2 глобально
npm install -g pm2

# Запуск backend
cd /var/www/24task-2/server
pm2 start src/server.js --name 24task-server

# Запуск frontend (статический сервер)
cd /var/www/24task-2/client
pm2 serve dist 3000 --name 24task-client --spa

# Сохранение конфигурации PM2
pm2 save

# Автозапуск PM2 при перезагрузке сервера
pm2 startup
# Выполните команду, которую выдаст PM2
```

## Шаг 5: Настройка Nginx

```bash
# Создание конфигурации Nginx
sudo nano /etc/nginx/sites-available/24task
```

### Конфигурация Nginx (HTTP):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Логи
    access_log /var/log/nginx/24task-access.log;
    error_log /var/log/nginx/24task-error.log;

    # Frontend (React SPA)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO для real-time обновлений
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Загруженные файлы
    location /uploads {
        alias /var/www/24task-2/server/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Активация конфигурации:

```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/24task /etc/nginx/sites-enabled/

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

## Шаг 6: Установка SSL сертификата (Let's Encrypt)

```bash
# Установка Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot автоматически настроит HTTPS
```

После установки SSL, Nginx конфигурация будет автоматически обновлена для HTTPS.

## Шаг 7: Настройка MongoDB

### Локальная MongoDB:

```bash
# Установка MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Запуск MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Создание пользователя MongoDB (опционально, для безопасности)
mongosh
> use admin
> db.createUser({
    user: "24task_admin",
    pwd: "secure_password",
    roles: ["readWrite", "dbAdmin"]
  })
> exit
```

### Или использование MongoDB Atlas (облачная БД):

1. Зарегистрируйтесь на https://www.mongodb.com/cloud/atlas
2. Создайте кластер
3. Получите connection string
4. Обновите `MONGODB_URI` в `.env` файле

## Шаг 8: Настройка Email (Gmail SMTP)

1. Войдите в ваш Gmail аккаунт
2. Перейдите в Настройки → Безопасность
3. Включите двухфакторную аутентификацию
4. Создайте "Пароль приложения" для SMTP
5. Используйте этот пароль в `.env` файле

## Шаг 9: Проверка работы

```bash
# Проверка статуса PM2
pm2 status

# Просмотр логов backend
pm2 logs 24task-server

# Просмотр логов frontend
pm2 logs 24task-client

# Проверка MongoDB
sudo systemctl status mongod

# Проверка Nginx
sudo systemctl status nginx
```

## Шаг 10: Обновление приложения

```bash
# Остановка процессов
pm2 stop all

# Обновление кода
cd /var/www/24task-2
git pull origin main

# Backend
cd server
npm install --production
pm2 restart 24task-server

# Frontend
cd ../client
npm install
npm run build
pm2 restart 24task-client

# Проверка
pm2 status
```

## Мониторинг и обслуживание

### Просмотр логов:

```bash
# PM2 логи
pm2 logs

# Nginx логи
sudo tail -f /var/log/nginx/24task-access.log
sudo tail -f /var/log/nginx/24task-error.log

# MongoDB логи
sudo tail -f /var/log/mongodb/mongod.log
```

### Резервное копирование MongoDB:

```bash
# Создание бэкапа
mongodump --db 24task --out /backup/mongodb/$(date +%Y%m%d)

# Восстановление из бэкапа
mongorestore --db 24task /backup/mongodb/20231231/24task
```

### Автоматическое резервное копирование (cron):

```bash
# Редактирование crontab
crontab -e

# Добавление задачи (бэкап каждый день в 2:00)
0 2 * * * mongodump --db 24task --out /backup/mongodb/$(date +\%Y\%m\%d)
```

## Решение проблем

### Backend не запускается:

```bash
# Проверка логов
pm2 logs 24task-server

# Проверка переменных окружения
cat server/.env

# Проверка подключения к MongoDB
mongosh --eval "db.adminCommand('ping')"
```

### Frontend не загружается:

```bash
# Проверка сборки
cd client
npm run build

# Проверка Nginx
sudo nginx -t
sudo systemctl status nginx
```

### Проблемы с Socket.IO:

Убедитесь, что в Nginx конфигурации правильно настроен proxy для `/socket.io`.

## Безопасность

1. **Firewall**: Настройте UFW для блокировки ненужных портов
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

2. **MongoDB**: Используйте аутентификацию и ограничьте доступ
3. **JWT Secret**: Используйте длинный случайный ключ
4. **SSL**: Всегда используйте HTTPS в production
5. **Обновления**: Регулярно обновляйте зависимости
   ```bash
   npm audit
   npm audit fix
   ```

## Производительность

### Оптимизация Nginx:

```nginx
# Добавьте в nginx.conf
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

client_max_body_size 100M;
```

### PM2 Cluster Mode (для высоких нагрузок):

```bash
pm2 start src/server.js --name 24task-server -i max
```

## Поддержка

При возникновении проблем:
1. Проверьте логи всех сервисов
2. Убедитесь, что все переменные окружения настроены правильно
3. Проверьте доступность MongoDB
4. Создайте Issue в GitHub репозитории
