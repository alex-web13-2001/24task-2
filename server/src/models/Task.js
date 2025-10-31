import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Название задачи обязательно'],
    trim: true,
    minlength: [2, 'Название должно содержать минимум 2 символа'],
    maxlength: [200, 'Название не должно превышать 200 символов']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Описание не должно превышать 2000 символов']
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null // null для личных задач
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    default: 'Assigned'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  deadline: {
    type: Date,
    default: null
  },
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  archived: {
    type: Boolean,
    default: false
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Индексы
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ authorId: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ archived: 1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ title: 'text', description: 'text' });

// Виртуальное поле для истории
taskSchema.virtual('history', {
  ref: 'TaskHistory',
  localField: '_id',
  foreignField: 'taskId'
});

// Метод для проверки просроченности
taskSchema.methods.isOverdue = function() {
  if (!this.deadline) return false;
  return new Date() > this.deadline && this.status !== 'Done';
};

const Task = mongoose.model('Task', taskSchema);

export default Task;
