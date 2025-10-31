import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  updateSettings
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Маршруты профиля
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Смена пароля
router.post('/change-password',
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  validate,
  changePassword
);

// Настройки
router.put('/settings', updateSettings);

// Удаление аккаунта
router.delete('/account', deleteAccount);

export default router;
