import express from 'express';
import {
  acceptInvitation,
  getInvitationInfo,
  revokeInvitation,
  getProjectInvitations
} from '../controllers/invitationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Публичный маршрут для получения информации о приглашении
router.get('/info/:token', getInvitationInfo);

// Защищенные маршруты
router.post('/accept', authenticate, acceptInvitation);
router.post('/:id/revoke', authenticate, revokeInvitation);
router.get('/project/:projectId', authenticate, getProjectInvitations);

export default router;
