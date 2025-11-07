const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Project routes
router.get('/', projectController.getAllProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Member routes
router.post('/:id/members', projectController.addMember);
router.delete('/:id/members/:userId', projectController.removeMember);
router.put('/:id/members/:userId', projectController.updateMemberRole);

module.exports = router;
