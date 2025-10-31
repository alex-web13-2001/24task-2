/**
 * Middleware для обработки ошибок
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Ошибки валидации Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации',
      errors
    });
  }

  // Ошибка дублирования (уникальный индекс)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} уже существует`
    });
  }

  // Ошибка CastError (неверный ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Неверный формат ID'
    });
  }

  // JWT ошибки
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Недействительный токен'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Токен истек'
    });
  }

  // Общая ошибка сервера
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Внутренняя ошибка сервера'
  });
};

/**
 * Middleware для обработки несуществующих маршрутов
 */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут не найден'
  });
};
