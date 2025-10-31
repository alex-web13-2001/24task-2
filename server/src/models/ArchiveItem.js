import mongoose from 'mongoose';

const archiveItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['project', 'task'],
    required: true
  },
  objectRef: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'type'
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restored: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Индексы
archiveItemSchema.index({ type: 1, objectRef: 1 });
archiveItemSchema.index({ archivedBy: 1 });
archiveItemSchema.index({ restored: 1 });

const ArchiveItem = mongoose.model('ArchiveItem', archiveItemSchema);

export default ArchiveItem;
