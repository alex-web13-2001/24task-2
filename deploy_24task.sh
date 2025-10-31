#!/bin/bash

# Скрипт автоматического развертывания 24Task на сервере
# Домен: 24task.ru
# Сервер: 82.97.253.158

set -e  # Остановка при ошибке

echo "=========================================="
echo "24Task Deployment Script"
echo "=========================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция для вывода статуса
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Переменные
PROJECT_DIR="/var/www/24task-2"
DOMAIN="24task.ru"
MONGODB_URI="mongodb://gen_user:>Uf%snl<}:\$j3c@176.53.163.200:27017/24task?authSource=admin"
EMAIL_HOST="smtp.timeweb.ru"
EMAIL_PORT="465"
EMAIL_USER="no-reply@24task.ru"
EMAIL_PASSWORD="7\\FmoXPF\\X_8y)"
FRONTEND_URL="https://$DOMAIN"

# Генерация JWT секрета
JWT_SECRET=$(openssl rand -hex 64)

echo "Шаг 1: Проверка и установка необходимых пакетов..."
print_status "Обновление системы..."
apt-get update -qq

# Проверка Node.js
if ! command -v node &> /dev/null; then
    print_warning "Node.js не установлен. Устанавливаю Node.js 22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
else
    NODE_VERSION=$(node -v)
    print_status "Node.js уже установлен: $NODE_VERSION"
fi

# Проверка Git
if ! command -v git &> /dev/null; then
    print_warning "Git не установлен. Устанавливаю..."
    apt-get install -y git
else
    print_status "Git уже установлен"
fi

# Проверка Nginx
if ! command -v nginx &> /dev/null; then
    print_warning "Nginx не установлен. Устанавливаю..."
    apt-get install -y nginx
else
    print_status "Nginx уже установлен"
fi

# Проверка PM2
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 не установлен. Устанавливаю..."
    npm install -g pm2
else
    print_status "PM2 уже установлен"
fi

echo ""
echo "Шаг 2: Клонирование проекта..."
cd /var/www

if [ -d "$PROJECT_DIR" ]; then
    print_warning "Директория проекта существует. Удаляю старую версию..."
    rm -rf "$PROJECT_DIR"
fi

print_status "Клонирование репозитория..."
git clone https://github.com/alex-web13-2001/24task-2.git
cd "$PROJECT_DIR"

echo ""
echo "Шаг 3: Настройка Backend..."
cd "$PROJECT_DIR/server"

print_status "Создание .env файла для backend..."
cat > .env << EOF
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=$MONGODB_URI

# JWT
JWT_SECRET=$JWT_SECRET
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email
EMAIL_HOST=$EMAIL_HOST
EMAIL_PORT=$EMAIL_PORT
EMAIL_SECURE=true
EMAIL_USER=$EMAIL_USER
EMAIL_PASSWORD=$EMAIL_PASSWORD
EMAIL_FROM=24Task <$EMAIL_USER>

# Frontend
FRONTEND_URL=$FRONTEND_URL

# CORS
CORS_ORIGIN=$FRONTEND_URL

# Files
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
EOF

print_status "Установка зависимостей backend..."
npm install --production --silent

echo ""
echo "Шаг 4: Настройка Frontend..."
cd "$PROJECT_DIR/client"

print_status "Создание .env файла для frontend..."
cat > .env << EOF
VITE_API_URL=https://$DOMAIN/api
VITE_SOCKET_URL=https://$DOMAIN
EOF

print_status "Установка зависимостей frontend..."
npm install --silent

print_status "Сборка frontend..."
npm run build

echo ""
echo "Шаг 5: Настройка PM2..."
cd "$PROJECT_DIR"

# Остановка старых процессов если есть
pm2 delete 24task-server 2>/dev/null || true
pm2 delete 24task-client 2>/dev/null || true

print_status "Запуск backend сервера..."
cd "$PROJECT_DIR/server"
pm2 start src/server.js --name 24task-server

print_status "Запуск frontend сервера..."
cd "$PROJECT_DIR/client"
pm2 serve dist 3000 --name 24task-client --spa

print_status "Сохранение конфигурации PM2..."
pm2 save

# Настройка автозапуска PM2
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo ""
echo "Шаг 6: Настройка Nginx..."

print_status "Создание конфигурации Nginx..."
cat > /etc/nginx/sites-available/24task << 'NGINX_EOF'
server {
    listen 80;
    server_name 24task.ru www.24task.ru;

    # Логи
    access_log /var/log/nginx/24task-access.log;
    error_log /var/log/nginx/24task-error.log;

    # Увеличение размера загружаемых файлов
    client_max_body_size 100M;

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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
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
NGINX_EOF

# Активация конфигурации
if [ -L /etc/nginx/sites-enabled/24task ]; then
    rm /etc/nginx/sites-enabled/24task
fi
ln -s /etc/nginx/sites-available/24task /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации если существует
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

print_status "Проверка конфигурации Nginx..."
nginx -t

print_status "Перезапуск Nginx..."
systemctl restart nginx

echo ""
echo "Шаг 7: Настройка SSL (Let's Encrypt)..."

# Проверка Certbot
if ! command -v certbot &> /dev/null; then
    print_warning "Certbot не установлен. Устанавливаю..."
    apt-get install -y certbot python3-certbot-nginx
fi

print_status "Получение SSL сертификата..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect || {
    print_warning "Не удалось получить SSL сертификат. Возможно, домен еще не привязан к серверу."
    print_warning "Вы можете запустить позже: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
}

echo ""
echo "Шаг 8: Настройка Firewall..."
if command -v ufw &> /dev/null; then
    print_status "Настройка UFW..."
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw --force enable || true
else
    print_warning "UFW не установлен. Пропускаю настройку firewall."
fi

echo ""
echo "Шаг 9: Проверка статуса сервисов..."
print_status "Статус PM2:"
pm2 status

print_status "Статус Nginx:"
systemctl status nginx --no-pager | head -5

echo ""
echo "=========================================="
echo -e "${GREEN}Развертывание завершено успешно!${NC}"
echo "=========================================="
echo ""
echo "Информация о приложении:"
echo "  - Frontend: http://$DOMAIN (или https://$DOMAIN если SSL установлен)"
echo "  - Backend API: http://$DOMAIN/api"
echo "  - MongoDB: 176.53.163.200:27017/24task"
echo ""
echo "Управление приложением:"
echo "  - Просмотр логов backend:  pm2 logs 24task-server"
echo "  - Просмотр логов frontend: pm2 logs 24task-client"
echo "  - Перезапуск backend:      pm2 restart 24task-server"
echo "  - Перезапуск frontend:     pm2 restart 24task-client"
echo "  - Остановка всех:          pm2 stop all"
echo "  - Статус:                  pm2 status"
echo ""
echo "Логи Nginx:"
echo "  - Access log: /var/log/nginx/24task-access.log"
echo "  - Error log:  /var/log/nginx/24task-error.log"
echo ""
echo "Обновление приложения:"
echo "  cd $PROJECT_DIR"
echo "  git pull origin main"
echo "  cd server && npm install --production && pm2 restart 24task-server"
echo "  cd ../client && npm install && npm run build && pm2 restart 24task-client"
echo ""
print_status "Откройте браузер и перейдите на https://$DOMAIN"
echo ""
