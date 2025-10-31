import Task from '../models/Task.js';
import Project from '../models/Project.js';
import TaskHistory from '../models/TaskHistory.js';
import Tag from '../models/Tag.js';

/**
 * Получение всех задач (с фильтрами)
 */
export const getTasks = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      projectId,
      status,
      priority,
      categoryId,
      assignee,
      tags,
      archived,
      search,
      personal
    } = req.query;

    let query = {};

    // Личные задачи или задачи из проектов
    if (personal === 'true') {
      query.projectId = null;
      query.authorId = userId;
    } else if (projectId) {
      query.projectId = projectId;
    } else {
      // Все задачи пользователя (из проектов где он участник + личные)
      const userProjects = await Project.find({
        $or: [
          { ownerId: userId },
          { 'members.userId': userId }
        ]
      }).select('_id');

      const projectIds = userProjects.map(p => p._id);

      query.$or = [
        { projectId: { $in: projectIds } },
        { projectId: null, authorId: userId }
      ];
    }

    // Фильтры
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (categoryId) query.categoryId = categoryId;
    if (assignee) query.assignee = assignee;
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (archived !== undefined) query.archived = archived === 'true';

    // Поиск
    if (search) {
      query.$text = { $search: search };
    }

    const tasks = await Task.find(query)
      .populate('projectId', 'title color')
      .populate('categoryId', 'title color')
      .populate('assignee', 'name email avatar')
      .populate('authorId', 'name email avatar')
      .populate('files')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение задачи по ID
 */
export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(id)
      .populate('projectId', 'title color')
      .populate('categoryId', 'title color')
      .populate('assignee', 'name email avatar')
      .populate('authorId', 'name email avatar')
      .populate('files');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Задача не найдена'
      });
    }

    // Проверка доступа
    if (task.projectId) {
      const project = await Project.findById(task.projectId);
      if (!project || !project.hasAccess(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Нет доступа к этой задаче'
        });
      }
    } else {
      // Личная задача - доступна только автору
      if (task.authorId._id.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Нет доступа к этой задаче'
        });
      }
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Создание новой задачи
 */
export const createTask = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      title,
      description,
      projectId,
      categoryId,
      tags,
      priority,
      status,
      assignee,
      deadline
    } = req.body;

    // Если задача в проекте, проверяем права
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Проект не найден'
        });
      }

      const userRole = project.getUserRole(userId);
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Нет доступа к этому проекту'
        });
      }

      // Member может создавать только свои задачи
      if (userRole === 'Member' && assignee && assignee !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'У вас нет прав назначать задачи другим пользователям'
        });
      }

      // Viewer не может создавать задачи
      if (userRole === 'Viewer') {
        return res.status(403).json({
          success: false,
          message: 'У вас нет прав создавать задачи в этом проекте'
        });
      }
    }

    // Создание задачи
    const task = await Task.create({
      title,
      description,
      projectId: projectId || null,
      categoryId,
      tags,
      priority,
      status: status || 'Assigned',
      assignee,
      deadline,
      authorId: userId
    });

    // Обновление счетчика использования тегов
    if (tags && tags.length > 0) {
      await updateTagsUsage(tags);
    }

    // Создание записи в истории
    await TaskHistory.create({
      taskId: task._id,
      userId,
      type: 'created',
      newValue: task.title
    });

    await task.populate('projectId', 'title color');
    await task.populate('categoryId', 'title color');
    await task.populate('assignee', 'name email avatar');
    await task.populate('authorId', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Задача успешно создана',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновление задачи
 */
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Задача не найдена'
      });
    }

    // Проверка прав
    let canEdit = false;

    if (task.projectId) {
      const project = await Project.findById(task.projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Проект не найден'
        });
      }

      const userRole = project.getUserRole(userId);
      
      if (userRole === 'Owner' || userRole === 'Collaborator') {
        canEdit = true;
      } else if (userRole === 'Member' && task.authorId.toString() === userId.toString()) {
        canEdit = true;
      }
    } else {
      // Личная задача - только автор может редактировать
      canEdit = task.authorId.toString() === userId.toString();
    }

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для редактирования задачи'
      });
    }

    // Сохранение старых значений для истории
    const oldValues = {
      status: task.status,
      priority: task.priority,
      assignee: task.assignee
    };

    // Обновление полей
    const allowedUpdates = ['title', 'description', 'categoryId', 'tags', 'priority', 'status', 'assignee', 'deadline'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        task[field] = updates[field];
      }
    });

    await task.save();

    // Создание записей в истории
    if (updates.status && updates.status !== oldValues.status) {
      await TaskHistory.create({
        taskId: task._id,
        userId,
        type: 'statusChange',
        oldValue: oldValues.status,
        newValue: updates.status
      });
    }

    if (updates.priority && updates.priority !== oldValues.priority) {
      await TaskHistory.create({
        taskId: task._id,
        userId,
        type: 'priorityChange',
        oldValue: oldValues.priority,
        newValue: updates.priority
      });
    }

    if (updates.assignee && updates.assignee !== oldValues.assignee?.toString()) {
      await TaskHistory.create({
        taskId: task._id,
        userId,
        type: 'assigneeChange',
        oldValue: oldValues.assignee,
        newValue: updates.assignee
      });
    }

    if (updates.title || updates.description) {
      await TaskHistory.create({
        taskId: task._id,
        userId,
        type: 'edit',
        newValue: 'Задача отредактирована'
      });
    }

    // Обновление тегов
    if (updates.tags) {
      await updateTagsUsage(updates.tags);
    }

    await task.populate('projectId', 'title color');
    await task.populate('categoryId', 'title color');
    await task.populate('assignee', 'name email avatar');
    await task.populate('authorId', 'name email avatar');

    res.json({
      success: true,
      message: 'Задача успешно обновлена',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Удаление задачи
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Задача не найдена'
      });
    }

    // Проверка прав (только автор или Owner/Collaborator проекта)
    let canDelete = false;

    if (task.projectId) {
      const project = await Project.findById(task.projectId);
      if (project) {
        const userRole = project.getUserRole(userId);
        canDelete = userRole === 'Owner' || userRole === 'Collaborator' || 
                   (userRole === 'Member' && task.authorId.toString() === userId.toString());
      }
    } else {
      canDelete = task.authorId.toString() === userId.toString();
    }

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для удаления задачи'
      });
    }

    // Удаление истории задачи
    await TaskHistory.deleteMany({ taskId: task._id });

    // Удаление задачи
    await task.deleteOne();

    res.json({
      success: true,
      message: 'Задача успешно удалена'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение истории задачи
 */
export const getTaskHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Задача не найдена'
      });
    }

    // Проверка доступа
    if (task.projectId) {
      const project = await Project.findById(task.projectId);
      if (!project || !project.hasAccess(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Нет доступа к этой задаче'
        });
      }
    } else {
      if (task.authorId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Нет доступа к этой задаче'
        });
      }
    }

    const history = await TaskHistory.find({ taskId: id })
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Вспомогательная функция для обновления счетчика использования тегов
 */
async function updateTagsUsage(tags) {
  for (const tagName of tags) {
    await Tag.findOneAndUpdate(
      { name: tagName.toLowerCase() },
      { $inc: { usageCount: 1 } },
      { upsert: true, new: true }
    );
  }
}
