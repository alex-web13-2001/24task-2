import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [2, 'Тег должен содержать минимум 2 символа'],
    maxlength: [30, 'Тег не должен превышать 30 символов']
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Индексы
tagSchema.index({ name: 1 });
tagSchema.index({ usageCount: -1 });

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;
