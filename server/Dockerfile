FROM node:22-alpine

WORKDIR /app

# Копирование package.json и установка зависимостей
COPY package*.json ./
RUN npm install --production

# Копирование исходного кода
COPY . .

# Создание директории для загрузок
RUN mkdir -p uploads

# Открытие порта
EXPOSE 5000

# Запуск приложения
CMD ["npm", "start"]
