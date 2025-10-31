import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskHistory
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Валидация для создания задачи
const createTaskValidation = [
  body('title').trim().notEmpty().withMessage('Название задачи обязательно')
];

// Маршруты задач
router.get('/', getTasks);
router.post('/', createTaskValidation, validate, createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/:id/history', getTaskHistory);

export default router;
