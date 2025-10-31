import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDatabase from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Импорт маршрутов
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Загрузка переменных окружения
dotenv.config();

// Создание Express приложения
const app = express();
const httpServer = createServer(app);

// Настройка Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  }
});

// Middleware
app.use(helmet()); // Безопасность заголовков
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: 'Слишком много запросов с этого IP, попробуйте позже'
});

app.use('/api/', limiter);

// Статические файлы для загрузок
app.use('/uploads', express.static('uploads'));

// Маршруты API
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/user', userRoutes);

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '24Task API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks',
      categories: '/api/categories',
      invitations: '/api/invitations',
      user: '/api/user'
    }
  });
});

// Обработка несуществующих маршрутов
app.use(notFound);

// Обработка ошибок
app.use(errorHandler);

// Socket.IO для real-time обновлений
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Присоединение к комнате проекта
  socket.on('join-project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`Socket ${socket.id} joined project:${projectId}`);
  });

  // Выход из комнаты проекта
  socket.on('leave-project', (projectId) => {
    socket.leave(`project:${projectId}`);
    console.log(`Socket ${socket.id} left project:${projectId}`);
  });

  // Присоединение к личной комнате пользователя
  socket.on('join-user', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`Socket ${socket.id} joined user:${userId}`);
  });

  // Отключение
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Экспорт io для использования в контроллерах
export { io };

// Подключение к базе данных и запуск сервера
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();
    
    httpServer.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   24Task Server Running                ║
║   Port: ${PORT}                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}           ║
║   MongoDB: Connected                   ║
║   Socket.IO: Active                    ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
