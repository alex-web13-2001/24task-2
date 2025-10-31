import express from 'express';
import {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Валидация для регистрации
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Имя обязательно'),
  body('email').isEmail().withMessage('Некорректный email'),
  body('password')
    .isLength({ min: 8 }).withMessage('Пароль должен содержать минимум 8 символов')
    .matches(/\d/).withMessage('Пароль должен содержать хотя бы одну цифру')
    .matches(/[a-zA-Z]/).withMessage('Пароль должен содержать хотя бы одну букву')
];

// Валидация для входа
const loginValidation = [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Пароль обязателен')
];

// Публичные маршруты
router.post('/register', registerValidation, validate, register);
router.post('/verify-email', body('token').notEmpty(), validate, verifyEmail);
router.post('/login', loginValidation, validate, login);
router.post('/refresh-token', body('refreshToken').notEmpty(), validate, refreshToken);
router.post('/forgot-password', body('email').isEmail(), validate, forgotPassword);
router.post('/reset-password', 
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  validate,
  resetPassword
);

// Защищенные маршруты
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

export default router;
