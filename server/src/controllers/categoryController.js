import Category from '../models/Category.js';
import Task from '../models/Task.js';

/**
 * Получение всех категорий
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .populate('usageCount')
      .sort({ title: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение категории по ID
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id).populate('usageCount');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Создание новой категории
 */
export const createCategory = async (req, res, next) => {
  try {
    const { title, color, description } = req.body;

    const category = await Category.create({
      title,
      color,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Категория успешно создана',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновление категории
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, color, description } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { title, color, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    res.json({
      success: true,
      message: 'Категория успешно обновлена',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Удаление категории
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    // Обнуление categoryId у всех задач с этой категорией
    await Task.updateMany(
      { categoryId: id },
      { categoryId: null }
    );

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Категория успешно удалена'
    });
  } catch (error) {
    next(error);
  }
};
