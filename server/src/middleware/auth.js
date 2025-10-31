import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Middleware для проверки JWT токена
 */
export const authenticate = async (req, res, next) => {
  try {
    // Получение токена из заголовка
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Токен не предоставлен'
      });
    }

    const token = authHeader.substring(7); // Убираем 'Bearer '

    // Верификация токена
    const decoded = verifyToken(token);

    // Получение пользователя из базы
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Аккаунт не активирован'
      });
    }

    // Добавление пользователя в request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Недействительный токен'
    });
  }
};

/**
 * Middleware для проверки активности пользователя
 */
export const checkUserStatus = async (req, res, next) => {
  if (req.user.status === 'disabled') {
    return res.status(403).json({
      success: false,
      message: 'Ваш аккаунт заблокирован'
    });
  }
  next();
};
