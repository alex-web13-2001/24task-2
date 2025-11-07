const { Project, ProjectMember, User, Task } = require('../models');
const { Op } = require('sequelize');

// Get all projects
exports.getAllProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all projects where user is a member
    const projectMembers = await ProjectMember.findAll({
      where: { user_id: userId },
      include: [{
        model: Project,
        as: 'project',
        where: { archived: false },
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'email', 'avatar_url']
          },
          {
            model: ProjectMember,
            as: 'projectMembers',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'avatar_url']
            }]
          }
        ]
      }]
    });

    // Transform data
    const projects = await Promise.all(projectMembers.map(async (pm) => {
      const project = pm.project;
      
      // Get task count
      const taskCount = await Task.count({
        where: {
          project_id: project.id,
          archived: false
        }
      });

      // Format members
      const members = project.projectMembers.map(member => ({
        user_id: member.user.id,
        email: member.user.email,
        name: member.user.name,
        avatar_url: member.user.avatar_url,
        role: member.role
      }));

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        color: project.color,
        owner_id: project.owner_id,
        owner: project.owner,
        members,
        task_count: taskCount,
        archived: project.archived,
        created_at: project.created_at,
        updated_at: project.updated_at
      };
    }));

    res.json({
      success: true,
      projects
    });
  } catch (error) {
    next(error);
  }
};

// Create project
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }

    // Create project
    const project = await Project.create({
      name,
      description: description || null,
      color: color || 'purple',
      owner_id: req.user.id
    });

    // Add creator as owner member
    await ProjectMember.create({
      project_id: project.id,
      user_id: req.user.id,
      role: 'owner'
    });

    // Fetch project with associations
    const createdProject = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'avatar_url']
        },
        {
          model: ProjectMember,
          as: 'projectMembers',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'avatar_url']
          }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      project: createdProject
    });
  } catch (error) {
    next(error);
  }
};

// Get project by ID
exports.getProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'avatar_url']
        },
        {
          model: ProjectMember,
          as: 'projectMembers',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'avatar_url']
          }]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if user is a member
    const isMember = project.projectMembers.some(
      pm => pm.user_id === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

// Update project
exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if user is owner or collaborator
    const member = await ProjectMember.findOne({
      where: {
        project_id: id,
        user_id: req.user.id,
        role: { [Op.in]: ['owner', 'collaborator'] }
      }
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        error: 'Only owner and collaborators can edit projects'
      });
    }

    // Update project
    await project.update(updates);

    // Fetch updated project
    const updatedProject = await Project.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'avatar_url']
        },
        {
          model: ProjectMember,
          as: 'projectMembers',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'avatar_url']
          }]
        }
      ]
    });

    res.json({
      success: true,
      project: updatedProject
    });
  } catch (error) {
    next(error);
  }
};

// Delete project
exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Only owner can delete
    if (project.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the project owner can delete it'
      });
    }

    await project.destroy();

    res.json({
      success: true
    });
  } catch (error) {
    next(error);
  }
};

// Add project member
exports.addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id, role } = req.body;

    if (!user_id || !role) {
      return res.status(400).json({
        success: false,
        error: 'user_id and role are required'
      });
    }

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Only owner can add members
    if (project.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the project owner can add members'
      });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if already a member
    const existingMember = await ProjectMember.findOne({
      where: {
        project_id: id,
        user_id
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        error: 'User is already a member'
      });
    }

    // Add member
    await ProjectMember.create({
      project_id: id,
      user_id,
      role
    });

    res.status(201).json({
      success: true
    });
  } catch (error) {
    next(error);
  }
};

// Remove project member
exports.removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Only owner can remove members
    if (project.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the project owner can remove members'
      });
    }

    // Cannot remove owner
    if (userId === project.owner_id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove project owner'
      });
    }

    const member = await ProjectMember.findOne({
      where: {
        project_id: id,
        user_id: userId
      }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }

    await member.destroy();

    res.json({
      success: true
    });
  } catch (error) {
    next(error);
  }
};

// Update member role
exports.updateMemberRole = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role is required'
      });
    }

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Only owner can update roles
    if (project.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the project owner can update member roles'
      });
    }

    // Cannot change owner role
    if (userId === project.owner_id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot change owner role'
      });
    }

    const member = await ProjectMember.findOne({
      where: {
        project_id: id,
        user_id: userId
      }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }

    await member.update({ role });

    res.json({
      success: true
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
