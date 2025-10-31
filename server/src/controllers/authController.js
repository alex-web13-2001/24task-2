import User from '../models/User.js';
import { generateTokenPair, verifyToken } from '../utils/jwt.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import crypto from 'crypto';

/**
 * Регистрация нового пользователя
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Проверка существования пользователя
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      });
    }

    // Создание токена подтверждения email
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 часа

    // Создание пользователя
    const user = await User.create({
      name,
      email,
      password,
      emailVerificationToken,
      emailVerificationExpires
    });

    // Отправка email подтверждения
    try {
      await sendVerificationEmail(email, name, emailVerificationToken);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Продолжаем даже если email не отправился
    }

    res.status(201).json({
      success: true,
      message: 'Регистрация успешна. Проверьте ваш email для подтверждения аккаунта.',
      data: {
        userId: user._id,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Подтверждение email
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Недействительный или истекший токен подтверждения'
      });
    }

    // Активация пользователя
    user.status = 'active';
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email успешно подтвержден. Теперь вы можете войти в систему.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Вход в систему
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя с паролем
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    // Проверка статуса
    if (user.status === 'pending') {
      return res.status(401).json({
        success: false,
        message: 'Пожалуйста, подтвердите ваш email перед входом'
      });
    }

    if (user.status === 'disabled') {
      return res.status(401).json({
        success: false,
        message: 'Ваш аккаунт заблокирован'
      });
    }

    // Проверка пароля
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    // Генерация токенов
    const { accessToken, refreshToken } = generateTokenPair(user._id);

    // Сохранение refresh токена
    user.refreshTokens.push({ token: refreshToken });
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Вход выполнен успешно',
      data: {
        user: user.toPublicProfile(),
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновление access токена через refresh токен
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh токен не предоставлен'
      });
    }

    // Верификация токена
    const decoded = verifyToken(refreshToken);

    // Поиск пользователя с этим refresh токеном
    const user = await User.findOne({
      _id: decoded.userId,
      'refreshTokens.token': refreshToken
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Недействительный refresh токен'
      });
    }

    // Генерация новой пары токенов
    const tokens = generateTokenPair(user._id);

    // Удаление старого refresh токена и добавление нового
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
    user.refreshTokens.push({ token: tokens.refreshToken });
    await user.save();

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Выход из системы
 */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Удаление refresh токена из базы
      await User.updateOne(
        { _id: req.user._id },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }

    res.json({
      success: true,
      message: 'Выход выполнен успешно'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Запрос на восстановление пароля
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Не сообщаем, существует ли пользователь (безопасность)
      return res.json({
        success: true,
        message: 'Если пользователь с таким email существует, письмо для восстановления пароля было отправлено'
      });
    }

    // Генерация токена восстановления
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 час
    await user.save();

    // Отправка email
    try {
      await sendPasswordResetEmail(email, user.name, resetToken);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    res.json({
      success: true,
      message: 'Если пользователь с таким email существует, письмо для восстановления пароля было отправлено'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Сброс пароля
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Недействительный или истекший токен восстановления'
      });
    }

    // Установка нового пароля
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Очистка всех refresh токенов
    await user.save();

    res.json({
      success: true,
      message: 'Пароль успешно изменен'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение текущего пользователя
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.user.toPublicProfile()
    });
  } catch (error) {
    next(error);
  }
};
