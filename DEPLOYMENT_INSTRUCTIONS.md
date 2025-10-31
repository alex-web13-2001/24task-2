# Инструкция по развертыванию 24Task на сервере 24task.ru

## Быстрый старт

Я подготовил полностью автоматический скрипт развертывания. Вам нужно выполнить всего несколько команд на сервере.

### Шаг 1: Подключитесь к серверу

```bash
ssh root@82.97.253.158
# Введите пароль: m8zU.LF*1SME4P
```

### Шаг 2: Скачайте скрипт развертывания

```bash
# Скачайте скрипт с GitHub
wget https://raw.githubusercontent.com/alex-web13-2001/24task-2/main/deploy_24task.sh

# Или создайте файл вручную и скопируйте содержимое
nano deploy_24task.sh
# Скопируйте содержимое из файла deploy_24task.sh

# Сделайте скрипт исполняемым
chmod +x deploy_24task.sh
```

### Шаг 3: Запустите скрипт

```bash
./deploy_24task.sh
```

Скрипт автоматически выполнит:
1. ✅ Установку Node.js 22, Git, Nginx, PM2
2. ✅ Клонирование проекта из GitHub
3. ✅ Настройку переменных окружения (MongoDB, Email SMTP)
4. ✅ Установку зависимостей backend и frontend
5. ✅ Сборку frontend
6. ✅ Запуск приложения через PM2
7. ✅ Настройку Nginx для домена 24task.ru
8. ✅ Установку SSL сертификата (Let's Encrypt)
9. ✅ Настройку firewall

### Шаг 4: Проверка

После завершения скрипта откройте в браузере:
- **https://24task.ru** - основное приложение

## Что делает скрипт

### Backend настройки (.env):
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://gen_user:>Uf%snl<}:$j3c@176.53.163.200:27017/24task?authSource=admin
JWT_SECRET=<автоматически сгенерированный 64-байтный ключ>
EMAIL_HOST=smtp.timeweb.ru
EMAIL_PORT=465
EMAIL_USER=no-reply@24task.ru
EMAIL_PASSWORD=7\FmoXPF\X_8y)
FRONTEND_URL=https://24task.ru
```

### Frontend настройки (.env):
```env
VITE_API_URL=https://24task.ru/api
VITE_SOCKET_URL=https://24task.ru
```

### PM2 процессы:
- `24task-server` - Backend API (порт 5000)
- `24task-client` - Frontend SPA (порт 3000)

### Nginx конфигурация:
- Домен: 24task.ru, www.24task.ru
- Frontend: `/` → localhost:3000
- Backend API: `/api` → localhost:5000
- Socket.IO: `/socket.io` → localhost:5000
- Uploads: `/uploads` → /var/www/24task-2/server/uploads
- SSL: Автоматически через Let's Encrypt

## Управление приложением

### Просмотр логов:
```bash
# Backend логи
pm2 logs 24task-server

# Frontend логи
pm2 logs 24task-client

# Nginx логи
tail -f /var/log/nginx/24task-access.log
tail -f /var/log/nginx/24task-error.log
```

### Перезапуск:
```bash
# Перезапуск backend
pm2 restart 24task-server

# Перезапуск frontend
pm2 restart 24task-client

# Перезапуск всех процессов
pm2 restart all

# Перезапуск Nginx
systemctl restart nginx
```

### Остановка:
```bash
# Остановка всех процессов
pm2 stop all

# Остановка конкретного процесса
pm2 stop 24task-server
pm2 stop 24task-client
```

### Статус:
```bash
# Статус PM2 процессов
pm2 status

# Статус Nginx
systemctl status nginx

# Статус всех сервисов
pm2 status && systemctl status nginx
```

## Обновление приложения

Когда нужно обновить приложение до новой версии:

```bash
cd /var/www/24task-2

# Получить последние изменения
git pull origin main

# Обновить backend
cd server
npm install --production
pm2 restart 24task-server

# Обновить frontend
cd ../client
npm install
npm run build
pm2 restart 24task-client
```

## Резервное копирование MongoDB

### Создание бэкапа:
```bash
# Установка mongodump (если не установлен)
apt-get install -y mongodb-database-tools

# Создание бэкапа
mongodump --host 176.53.163.200 --port 27017 \
  --username gen_user --password '>Uf%snl<}:$j3c' \
  --authenticationDatabase admin \
  --db 24task \
  --out /backup/mongodb/$(date +%Y%m%d)
```

### Восстановление из бэкапа:
```bash
mongorestore --host 176.53.163.200 --port 27017 \
  --username gen_user --password '>Uf%snl<}:$j3c' \
  --authenticationDatabase admin \
  --db 24task \
  /backup/mongodb/20241031/24task
```

### Автоматическое резервное копирование (cron):
```bash
# Редактирование crontab
crontab -e

# Добавить строку (бэкап каждый день в 2:00)
0 2 * * * mongodump --host 176.53.163.200 --port 27017 --username gen_user --password '>Uf%snl<}:$j3c' --authenticationDatabase admin --db 24task --out /backup/mongodb/$(date +\%Y\%m\%d)
```

## Проверка работы SSL

После установки SSL сертификата проверьте:

```bash
# Проверка сертификата
openssl s_client -connect 24task.ru:443 -servername 24task.ru

# Автоматическое обновление сертификата (уже настроено)
certbot renew --dry-run
```

## Решение проблем

### Backend не запускается:
```bash
# Проверка логов
pm2 logs 24task-server --lines 100

# Проверка переменных окружения
cat /var/www/24task-2/server/.env

# Проверка подключения к MongoDB
mongosh --host 176.53.163.200 --port 27017 --username gen_user --password '>Uf%snl<}:$j3c' --authenticationDatabase admin --eval "use 24task; db.stats()"
```

### Frontend не загружается:
```bash
# Проверка логов
pm2 logs 24task-client --lines 100

# Проверка сборки
cd /var/www/24task-2/client
npm run build

# Перезапуск
pm2 restart 24task-client
```

### Nginx ошибки:
```bash
# Проверка конфигурации
nginx -t

# Проверка логов
tail -f /var/log/nginx/24task-error.log

# Перезапуск
systemctl restart nginx
```

### Проблемы с SSL:
```bash
# Повторная установка сертификата
certbot --nginx -d 24task.ru -d www.24task.ru --force-renewal
```

## Мониторинг

### Установка мониторинга PM2:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Просмотр использования ресурсов:
```bash
pm2 monit
```

## Безопасность

### Рекомендации:
1. ✅ SSL сертификат установлен (Let's Encrypt)
2. ✅ Firewall настроен (UFW)
3. ✅ JWT секрет автоматически сгенерирован
4. ⚠️ Смените пароль root после первого входа
5. ⚠️ Настройте SSH ключи вместо пароля
6. ⚠️ Отключите root login в SSH

### Смена пароля root:
```bash
passwd
```

### Настройка SSH ключей:
```bash
# На вашем локальном компьютере
ssh-keygen -t ed25519
ssh-copy-id root@82.97.253.158

# На сервере отключите парольную аутентификацию
nano /etc/ssh/sshd_config
# Установите: PasswordAuthentication no
systemctl restart sshd
```

## Контакты

При возникновении проблем:
- GitHub Issues: https://github.com/alex-web13-2001/24task-2/issues
- Email: admin@24task.ru

---

**Готово к использованию!** 🚀
