import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Invitation from '../models/Invitation.js';
import { sendProjectInvitation } from '../utils/email.js';

/**
 * Получение всех проектов пользователя
 */
export const getProjects = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const userId = req.user._id;

    let query = {
      $or: [
        { ownerId: userId },
        { 'members.userId': userId }
      ]
    };

    // Фильтр по статусу
    if (status) {
      query.status = status;
    }

    // Фильтр по типу (свои/приглашенные)
    if (type === 'own') {
      query = { ownerId: userId, ...query };
    } else if (type === 'invited') {
      query = { 
        'members.userId': userId,
        ownerId: { $ne: userId }
      };
    }

    const projects = await Project.find(query)
      .populate('ownerId', 'name email avatar')
      .populate('members.userId', 'name email avatar')
      .populate('categories', 'title color')
      .sort({ updatedAt: -1 });

    // Добавление статистики задач для каждого проекта
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ projectId: project._id, archived: false });
        const overdueTasks = await Task.countDocuments({
          projectId: project._id,
          archived: false,
          deadline: { $lt: new Date() },
          status: { $ne: 'Done' }
        });

        return {
          ...project.toObject(),
          stats: {
            totalTasks,
            overdueTasks
          },
          userRole: project.getUserRole(userId)
        };
      })
    );

    res.json({
      success: true,
      data: projectsWithStats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение проекта по ID
 */
export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(id)
      .populate('ownerId', 'name email avatar')
      .populate('members.userId', 'name email avatar')
      .populate('categories', 'title color')
      .populate('files');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }

    // Проверка доступа
    if (!project.hasAccess(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Нет доступа к этому проекту'
      });
    }

    // Статистика задач
    const totalTasks = await Task.countDocuments({ projectId: project._id, archived: false });
    const overdueTasks = await Task.countDocuments({
      projectId: project._id,
      archived: false,
      deadline: { $lt: new Date() },
      status: { $ne: 'Done' }
    });

    res.json({
      success: true,
      data: {
        ...project.toObject(),
        stats: {
          totalTasks,
          overdueTasks
        },
        userRole: project.getUserRole(userId)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Создание нового проекта
 */
export const createProject = async (req, res, next) => {
  try {
    const { title, description, color, links, categories } = req.body;
    const userId = req.user._id;

    const project = await Project.create({
      title,
      description,
      color,
      links,
      categories,
      ownerId: userId
    });

    await project.populate('ownerId', 'name email avatar');
    await project.populate('categories', 'title color');

    res.status(201).json({
      success: true,
      message: 'Проект успешно создан',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновление проекта
 */
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }

    // Проверка прав (Owner или Collaborator)
    if (!project.hasAccess(userId, ['Owner', 'Collaborator'])) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для редактирования проекта'
      });
    }

    // Обновление полей
    const allowedUpdates = ['title', 'description', 'color', 'links', 'categories', 'tags'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        project[field] = updates[field];
      }
    });

    await project.save();
    await project.populate('ownerId', 'name email avatar');
    await project.populate('members.userId', 'name email avatar');
    await project.populate('categories', 'title color');

    res.json({
      success: true,
      message: 'Проект успешно обновлен',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Архивирование проекта
 */
export const archiveProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }

    // Только владелец может архивировать
    if (project.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Только владелец может архивировать проект'
      });
    }

    project.status = 'archived';
    await project.save();

    // Архивирование всех задач проекта
    await Task.updateMany(
      { projectId: project._id },
      { archived: true }
    );

    res.json({
      success: true,
      message: 'Проект успешно архивирован',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Восстановление проекта из архива
 */
export const restoreProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }

    // Только владелец может восстанавливать
    if (project.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Только владелец может восстановить проект'
      });
    }

    project.status = 'active';
    await project.save();

    // Восстановление задач проекта
    await Task.updateMany(
      { projectId: project._id },
      { archived: false }
    );

    res.json({
      success: true,
      message: 'Проект успешно восстановлен',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Удаление проекта
 */
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }

    // Только владелец может удалять
    if (project.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Только владелец может удалить проект'
      });
    }

    // Удаление всех задач проекта
    await Task.deleteMany({ projectId: project._id });

    // Удаление всех приглашений
    await Invitation.deleteMany({ projectId: project._id });

    // Удаление проекта
    await project.deleteOne();

    res.json({
      success: true,
      message: 'Проект успешно удален'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Управление колонками проекта
 */
export const updateColumns = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { columns } = req.body;
    const userId = req.user._id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }

    // Проверка прав (Owner или Collaborator)
    if (!project.hasAccess(userId, ['Owner', 'Collaborator'])) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для изменения колонок'
      });
    }

    project.columns = columns;
    await project.save();

    res.json({
      success: true,
      message: 'Колонки успешно обновлены',
      data: project.columns
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Приглашение пользователя в проект
 */
export const inviteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const userId = req.user._id;

    const project = await Project.findById(id).populate('ownerId', 'name');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }

    // Только владелец может приглашать
    if (project.ownerId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Только владелец может приглашать пользователей'
      });
    }

    // Проверка, не приглашен ли уже пользователь
    const existingInvitation = await Invitation.findOne({
      email,
      projectId: project._id,
      status: 'pending'
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'Приглашение для этого email уже отправлено'
      });
    }

    // Создание приглашения
    const invitation = await Invitation.create({
      email,
      projectId: project._id,
      role,
      invitedBy: userId
    });

    // Отправка email
    try {
      await sendProjectInvitation(email, project.title, project.ownerId.name, invitation.token, role);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Приглашение успешно отправлено',
      data: invitation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Удаление участника из проекта
 */
export const removeMember = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }

    // Только владелец может удалять участников
    if (project.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Только владелец может удалять участников'
      });
    }

    // Нельзя удалить владельца
    if (memberId === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Владелец не может удалить себя из проекта'
      });
    }

    // Удаление участника
    project.members = project.members.filter(
      m => m.userId.toString() !== memberId
    );

    await project.save();

    res.json({
      success: true,
      message: 'Участник успешно удален из проекта'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Изменение роли участника
 */
export const updateMemberRole = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user._id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }

    // Только владелец может изменять роли
    if (project.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Только владелец может изменять роли участников'
      });
    }

    // Нельзя изменить роль владельца
    if (memberId === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя изменить роль владельца'
      });
    }

    // Обновление роли
    const member = project.members.find(m => m.userId.toString() === memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Участник не найден'
      });
    }

    member.role = role;
    await project.save();

    res.json({
      success: true,
      message: 'Роль участника успешно обновлена',
      data: member
    });
  } catch (error) {
    next(error);
  }
};
