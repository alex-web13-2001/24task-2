import mongoose from 'mongoose';

const taskHistorySchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['statusChange', 'assigneeChange', 'edit', 'fileAdd', 'fileRemove', 'priorityChange', 'created'],
    required: true
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
});

// Индексы
taskHistorySchema.index({ taskId: 1, createdAt: -1 });
taskHistorySchema.index({ userId: 1 });

// TTL индекс - автоматическое удаление записей старше 90 дней
taskHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 дней

const TaskHistory = mongoose.model('TaskHistory', taskHistorySchema);

export default TaskHistory;
