import Invitation from '../models/Invitation.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

/**
 * Принятие приглашения в проект
 */
export const acceptInvitation = async (req, res, next) => {
  try {
    const { token } = req.body;
    const userId = req.user._id;

    const invitation = await Invitation.findOne({ token })
      .populate('projectId', 'title color ownerId');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Приглашение не найдено'
      });
    }

    // Проверка валидности
    if (!invitation.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Приглашение истекло или уже использовано'
      });
    }

    // Проверка email
    if (invitation.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Это приглашение предназначено для другого email'
      });
    }

    // Добавление пользователя в проект
    const project = await Project.findById(invitation.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }

    // Проверка, не является ли пользователь уже участником
    const alreadyMember = project.members.some(
      m => m.userId.toString() === userId.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'Вы уже являетесь участником этого проекта'
      });
    }

    // Добавление участника
    project.members.push({
      userId,
      role: invitation.role,
      addedAt: new Date()
    });

    await project.save();

    // Обновление статуса приглашения
    invitation.status = 'accepted';
    await invitation.save();

    res.json({
      success: true,
      message: 'Вы успешно присоединились к проекту',
      data: {
        project: {
          _id: project._id,
          title: project.title,
          color: project.color
        },
        role: invitation.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение информации о приглашении по токену (для неавторизованных)
 */
export const getInvitationInfo = async (req, res, next) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ token })
      .populate('projectId', 'title color description')
      .populate('invitedBy', 'name email');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Приглашение не найдено'
      });
    }

    if (!invitation.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Приглашение истекло или уже использовано',
        data: {
          status: invitation.status
        }
      });
    }

    res.json({
      success: true,
      data: {
        email: invitation.email,
        project: invitation.projectId,
        role: invitation.role,
        invitedBy: invitation.invitedBy,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Отмена приглашения (только владелец проекта)
 */
export const revokeInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const invitation = await Invitation.findById(id).populate('projectId');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Приглашение не найдено'
      });
    }

    // Проверка прав (только владелец проекта)
    if (invitation.projectId.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Только владелец проекта может отменить приглашение'
      });
    }

    invitation.status = 'revoked';
    await invitation.save();

    res.json({
      success: true,
      message: 'Приглашение успешно отменено'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение всех приглашений проекта
 */
export const getProjectInvitations = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Проект не найден'
      });
    }

    // Только владелец может просматривать приглашения
    if (project.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Только владелец проекта может просматривать приглашения'
      });
    }

    const invitations = await Invitation.find({ projectId })
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: invitations
    });
  } catch (error) {
    next(error);
  }
};
