import User from '../models/User.js';

/**
 * Получение профиля пользователя
 */
export const getProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.user.toPublicProfile()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновление профиля пользователя
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Профиль успешно обновлен',
      data: user.toPublicProfile()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Смена пароля
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId).select('+password');

    // Проверка текущего пароля
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Неверный текущий пароль'
      });
    }

    // Установка нового пароля
    user.password = newPassword;
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
 * Удаление аккаунта
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Здесь можно добавить дополнительную логику:
    // - Удаление всех личных задач
    // - Передача владения проектами
    // - Удаление из всех проектов
    
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Аккаунт успешно удален'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновление настроек пользователя
 */
export const updateSettings = async (req, res, next) => {
  try {
    const { language, theme, notifications } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (language) user.settings.language = language;
    if (theme) user.settings.theme = theme;
    if (notifications) {
      if (notifications.email !== undefined) user.settings.notifications.email = notifications.email;
      if (notifications.push !== undefined) user.settings.notifications.push = notifications.push;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Настройки успешно обновлены',
      data: user.settings
    });
  } catch (error) {
    next(error);
  }
};
