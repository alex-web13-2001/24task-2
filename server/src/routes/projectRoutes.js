import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  archiveProject,
  restoreProject,
  deleteProject,
  updateColumns,
  inviteUser,
  removeMember,
  updateMemberRole
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Валидация для создания проекта
const createProjectValidation = [
  body('title').trim().notEmpty().withMessage('Название проекта обязательно')
];

// Маршруты проектов
router.get('/', getProjects);
router.post('/', createProjectValidation, validate, createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.post('/:id/archive', archiveProject);
router.post('/:id/restore', restoreProject);
router.delete('/:id', deleteProject);

// Управление колонками
router.put('/:id/columns', updateColumns);

// Управление участниками
router.post('/:id/invite', 
  body('email').isEmail(),
  body('role').isIn(['Collaborator', 'Member', 'Viewer']),
  validate,
  inviteUser
);
router.delete('/:id/members/:memberId', removeMember);
router.put('/:id/members/:memberId/role',
  body('role').isIn(['Collaborator', 'Member', 'Viewer']),
  validate,
  updateMemberRole
);

export default router;
