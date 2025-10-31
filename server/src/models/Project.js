import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const columnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const membershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['Owner', 'Collaborator', 'Member', 'Viewer'],
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Название проекта обязательно'],
    trim: true,
    minlength: [2, 'Название должно содержать минимум 2 символа'],
    maxlength: [100, 'Название не должно превышать 100 символов']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Описание не должно превышать 1000 символов']
  },
  color: {
    type: String,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Пожалуйста, введите корректный HEX цвет'],
    default: '#3B82F6'
  },
  links: [linkSchema],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  columns: {
    type: [columnSchema],
    default: function() {
      return [
        { title: 'Assigned', order: 0, isDefault: false },
        { title: 'In Progress', order: 1, isDefault: false },
        { title: 'Done', order: 2, isDefault: true }
      ];
    }
  },
  members: [membershipSchema]
}, {
  timestamps: true
});

// Индексы
projectSchema.index({ ownerId: 1, status: 1 });
projectSchema.index({ 'members.userId': 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ title: 'text', description: 'text' });

// Автоматическое добавление владельца в members при создании
projectSchema.pre('save', function(next) {
  if (this.isNew) {
    // Проверяем, не добавлен ли уже владелец
    const ownerExists = this.members.some(member => 
      member.userId.toString() === this.ownerId.toString()
    );
    
    if (!ownerExists) {
      this.members.push({
        userId: this.ownerId,
        role: 'Owner',
        addedAt: new Date()
      });
    }
  }
  next();
});

// Метод для проверки прав пользователя
projectSchema.methods.getUserRole = function(userId) {
  const member = this.members.find(m => m.userId.toString() === userId.toString());
  return member ? member.role : null;
};

// Метод для проверки доступа
projectSchema.methods.hasAccess = function(userId, requiredRoles = []) {
  const role = this.getUserRole(userId);
  if (!role) return false;
  if (requiredRoles.length === 0) return true;
  return requiredRoles.includes(role);
};

const Project = mongoose.model('Project', projectSchema);

export default Project;
