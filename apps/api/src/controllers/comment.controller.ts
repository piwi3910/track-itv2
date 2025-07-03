import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CommentService } from '../services/comment.service';
import { validateBody, validateParams } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { idParamSchema } from '@track-it/shared';

const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  taskId: z.string().cuid(),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export class CommentController {
  private commentService = new CommentService();

  create = [
    authenticateToken,
    validateBody(createCommentSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }
        const comment = await this.commentService.create(req.body, req.user.userId);
        res.status(201).json(comment);
      } catch (error) {
        next(error);
      }
    },
  ];

  listByTask = [
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }
        const { taskId } = req.params;
        const comments = await this.commentService.findByTask(taskId, req.user.userId);
        res.json(comments);
      } catch (error) {
        next(error);
      }
    },
  ];

  update = [
    authenticateToken,
    validateParams(idParamSchema),
    validateBody(updateCommentSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }
        const comment = await this.commentService.update(req.params.id, req.body, req.user.userId);
        res.json(comment);
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
        await this.commentService.delete(req.params.id, req.user.userId);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  ];
}