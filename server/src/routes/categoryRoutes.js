import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Валидация для создания/обновления категории
const categoryValidation = [
  body('title').trim().notEmpty().withMessage('Название категории обязательно'),
  body('color').matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Некорректный HEX цвет')
];

// Маршруты категорий
router.get('/', getCategories);
router.post('/', categoryValidation, validate, createCategory);
router.get('/:id', getCategoryById);
router.put('/:id', categoryValidation, validate, updateCategory);
router.delete('/:id', deleteCategory);

export default router;
