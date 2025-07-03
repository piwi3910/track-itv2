import { Request, Response, NextFunction } from 'express';
import { ProjectRole } from '@track-it/database';
import { createProjectSchema, updateProjectSchema, searchSchema, idParamSchema } from '@track-it/shared';
import { ProjectService } from '../services/project.service';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

export class ProjectController {
  private projectService = new ProjectService();

  list = [
    authenticateToken,
    validateQuery(searchSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }
        const projects = await this.projectService.findAll(req.user.userId, req.query);
        res.json(projects);
      } catch (error) {
        next(error);
      }
    },
  ];

  get = [
    authenticateToken,
    validateParams(idParamSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }
        const project = await this.projectService.findById(req.params.id, req.user.userId);
        res.json(project);
      } catch (error) {
        next(error);
      }
    },
  ];

  create = [
    authenticateToken,
    validateBody(createProjectSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }
        const project = await this.projectService.create(req.body, req.user.userId);
        res.status(201).json(project);
      } catch (error) {
        next(error);
      }
    },
  ];

  update = [
    authenticateToken,
    validateParams(idParamSchema),
    validateBody(updateProjectSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }
        const project = await this.projectService.update(req.params.id, req.body, req.user.userId);
        res.json(project);
      } catch (error) {
        next(error);
      }
    },
  ];

  delete = [
    authenticateToken,
    validateParams(idParamSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }
        await this.projectService.delete(req.params.id, req.user.userId);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  ];

  addMember = [
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }
        const { userId, role = ProjectRole.MEMBER } = req.body;
        const member = await this.projectService.addMember(
          req.params.id,
          userId,
          role,
          req.user.userId
        );
        res.status(201).json(member);
      } catch (error) {
        next(error);
      }
    },
  ];

  updateMemberRole = [
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }
        const { role } = req.body;
        const member = await this.projectService.updateMemberRole(
          req.params.id,
          req.params.memberId,
          role,
          req.user.userId
        );
        res.json(member);
      } catch (error) {
        next(error);
      }
    },
  ];

  removeMember = [
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }
        await this.projectService.removeMember(
          req.params.id,
          req.params.memberId,
          req.user.userId
        );
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  ];
}