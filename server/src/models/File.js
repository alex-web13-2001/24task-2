import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Индексы
fileSchema.index({ ownerId: 1 });
fileSchema.index({ projectId: 1 });
fileSchema.index({ taskId: 1 });

// Валидация размера файла
fileSchema.pre('save', function(next) {
  const maxSize = 104857600; // 100 MB
  if (this.size > maxSize) {
    next(new Error('Размер файла превышает максимально допустимый (100 МБ)'));
  } else {
    next();
  }
});

const File = mongoose.model('File', fileSchema);

export default File;
