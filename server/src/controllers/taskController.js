const { Task, User, Project, ProjectMember, Category, TaskAttachment, TaskComment } = require('../models');
const { Op } = require('sequelize');

// Get all tasks
exports.getAllTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { project_id, status, priority, assignee_id } = req.query;

    // Build where clause
    const where = {
      archived: false
    };

    if (project_id) {
      where.project_id = project_id;
    }
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (assignee_id) {
      where.assignee_id = assignee_id;
    }

    // Get user's project IDs
    const projectMembers = await ProjectMember.findAll({
      where: { user_id: userId },
      attributes: ['project_id']
    });
    const projectIds = projectMembers.map(pm => pm.project_id);

    // Get tasks where user is creator, assignee, or member of project
    const tasks = await Task.findAll({
      where: {
        ...where,
        [Op.or]: [
          { created_by: userId },
          { assignee_id: userId },
          { project_id: { [Op.in]: projectIds } },
          { project_id: null } // Personal tasks
        ]
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'avatar_url']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email', 'avatar_url']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'color']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'color']
        },
        {
          model: TaskAttachment,
          as: 'attachments',
          attributes: ['id', 'name', 'url', 'size', 'uploaded_at']
        },
        {
          model: TaskComment,
          as: 'comments',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'avatar_url']
          }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

// Create task
exports.createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      project_id,
      assignee_id,
      category_id,
      due_date
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    // Check project access if project_id is provided
    if (project_id) {
      const projectMember = await ProjectMember.findOne({
        where: {
          project_id,
          user_id: req.user.id
        }
      });

      if (!projectMember) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this project'
        });
      }
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      status: status || 'к выполнению',
      priority: priority || 'средний',
      project_id: project_id || null,
      assignee_id: assignee_id || null,
      category_id: category_id || null,
      due_date: due_date || null,
      created_by: req.user.id
    });

    // Fetch task with associations
    const createdTask = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'avatar_url']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email', 'avatar_url']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'color']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'color']
        }
      ]
    });

    res.status(201).json({
      success: true,
      task: createdTask
    });
  } catch (error) {
    next(error);
  }
};

// Get task by ID
exports.getTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'avatar_url']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email', 'avatar_url']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'color']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'color']
        },
        {
          model: TaskAttachment,
          as: 'attachments'
        },
        {
          model: TaskComment,
          as: 'comments',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'avatar_url']
          }]
        }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check access
    const hasAccess = await checkTaskAccess(task, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

// Update task
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check access
    const hasAccess = await checkTaskAccess(task, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Update task
    await task.update(updates);

    // Fetch updated task with associations
    const updatedTask = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'avatar_url']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email', 'avatar_url']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'color']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'color']
        }
      ]
    });

    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// Delete task
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user is creator or project owner
    let canDelete = task.created_by === req.user.id;

    if (task.project_id && !canDelete) {
      const project = await Project.findByPk(task.project_id);
      canDelete = project && project.owner_id === req.user.id;
    }

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        error: 'Only task creator or project owner can delete this task'
      });
    }

    await task.destroy();

    res.json({
      success: true
    });
  } catch (error) {
    next(error);
  }
};

// Add comment
exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Comment text is required'
      });
    }

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check access
    const hasAccess = await checkTaskAccess(task, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Create comment
    const comment = await TaskComment.create({
      task_id: id,
      user_id: req.user.id,
      text
    });

    // Fetch comment with user
    const createdComment = await TaskComment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'avatar_url']
      }]
    });

    res.status(201).json({
      success: true,
      comment: createdComment
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to check task access
async function checkTaskAccess(task, userId) {
  // Creator or assignee has access
  if (task.created_by === userId || task.assignee_id === userId) {
    return true;
  }

  // Personal task (no project)
  if (!task.project_id) {
    return false;
  }

  // Check if user is project member
  const projectMember = await ProjectMember.findOne({
    where: {
      project_id: task.project_id,
      user_id: userId
    }
  });

  return !!projectMember;
}

module.exports = exports;
