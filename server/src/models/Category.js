import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Название категории обязательно'],
    trim: true,
    unique: true,
    minlength: [2, 'Название должно содержать минимум 2 символа'],
    maxlength: [50, 'Название не должно превышать 50 символов']
  },
  color: {
    type: String,
    required: [true, 'Цвет категории обязателен'],
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Пожалуйста, введите корректный HEX цвет'],
    default: '#3B82F6'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Описание не должно превышать 200 символов']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Индексы
categorySchema.index({ title: 1 });

// Виртуальное поле для подсчета использований в задачах
categorySchema.virtual('usageCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'categoryId',
  count: true
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
