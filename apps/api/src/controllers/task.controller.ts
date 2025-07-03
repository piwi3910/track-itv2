import { Request, Response, NextFunction } from 'express';
import { createTaskSchema, updateTaskSchema, searchSchema, idParamSchema } from '@track-it/shared';
import { TaskService } from '../services/task.service';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

export class TaskController {
  private taskService = new TaskService();

  list = [
    authenticateToken,
    validateQuery(searchSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }
        const projectId = req.query.projectId as string | undefined;
        const tasks = await this.taskService.findAll(req.user.userId, projectId, req.query);
        res.json(tasks);
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
        const task = await this.taskService.findById(req.params.id, req.user.userId);
        res.json(task);
      } catch (error) {
        next(error);
      }
    },
  ];

  create = [
    authenticateToken,
    validateBody(createTaskSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }
        const task = await this.taskService.create(req.body, req.user.userId);
        res.status(201).json(task);
      } catch (error) {
        next(error);
      }
    },
  ];

  update = [
    authenticateToken,
    validateParams(idParamSchema),
    validateBody(updateTaskSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }
        const task = await this.taskService.update(req.params.id, req.body, req.user.userId);
        res.json(task);
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
        await this.taskService.delete(req.params.id, req.user.userId);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  ];

  updatePosition = [
    authenticateToken,
    validateParams(idParamSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }
        const { position } = req.body;
        const task = await this.taskService.updatePosition(req.params.id, position, req.user.userId);
        res.json(task);
      } catch (error) {
        next(error);
      }
    },
  ];
}