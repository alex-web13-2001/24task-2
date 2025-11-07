const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Task = require('./Task');
const Category = require('./Category');
const TaskAttachment = require('./TaskAttachment');
const TaskComment = require('./TaskComment');

// User associations
User.hasMany(Project, { foreignKey: 'owner_id', as: 'ownedProjects' });
User.hasMany(Task, { foreignKey: 'created_by', as: 'createdTasks' });
User.hasMany(Task, { foreignKey: 'assignee_id', as: 'assignedTasks' });
User.hasMany(Category, { foreignKey: 'user_id', as: 'categories' });
User.hasMany(TaskComment, { foreignKey: 'user_id', as: 'comments' });
User.belongsToMany(Project, { through: ProjectMember, foreignKey: 'user_id', as: 'projects' });

// Project associations
Project.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks' });
Project.belongsToMany(User, { through: ProjectMember, foreignKey: 'project_id', as: 'members' });
Project.hasMany(ProjectMember, { foreignKey: 'project_id', as: 'projectMembers' });

// Task associations
Task.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Task.belongsTo(User, { foreignKey: 'assignee_id', as: 'assignee' });
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });
Task.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Task.hasMany(TaskAttachment, { foreignKey: 'task_id', as: 'attachments' });
Task.hasMany(TaskComment, { foreignKey: 'task_id', as: 'comments' });

// TaskAttachment associations
TaskAttachment.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

// TaskComment associations
TaskComment.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
TaskComment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Category associations
Category.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Category.hasMany(Task, { foreignKey: 'category_id', as: 'tasks' });

// ProjectMember associations
ProjectMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
ProjectMember.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

module.exports = {
  User,
  Project,
  ProjectMember,
  Task,
  Category,
  TaskAttachment,
  TaskComment
};
