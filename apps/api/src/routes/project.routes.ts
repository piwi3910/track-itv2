import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';

export const projectRouter = Router();
const projectController = new ProjectController();

// Project CRUD routes
projectRouter.get('/', projectController.list);
projectRouter.post('/', projectController.create);
projectRouter.get('/:id', projectController.get);
projectRouter.put('/:id', projectController.update);
projectRouter.delete('/:id', projectController.delete);

// Project member routes
projectRouter.post('/:id/members', projectController.addMember);
projectRouter.put('/:id/members/:memberId', projectController.updateMemberRole);
projectRouter.delete('/:id/members/:memberId', projectController.removeMember);