const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaskAttachment = sequelize.define('TaskAttachment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  task_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tasks',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'task_attachments',
  timestamps: false
});

module.exports = TaskAttachment;
