import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { NotificationService } from '../services/notification.service';
import { validateQuery, validateParams } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { idParamSchema } from '@track-it/shared';

const listNotificationsSchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  unreadOnly: z.string().transform(val => val === 'true').optional(),
});

export class NotificationController {
  private notificationService = new NotificationService();

  list = [
    authenticateToken,
    validateQuery(listNotificationsSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const { limit, offset, unreadOnly } = req.query as any;
        const notifications = await this.notificationService.findByUser(req.user.userId, {
          limit: limit || 20,
          offset: offset || 0,
          unreadOnly: unreadOnly || false,
        });

        res.json(notifications);
      } catch (error) {
        next(error);
      }
    },
  ];

  markAsRead = [
    authenticateToken,
    validateParams(idParamSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const notification = await this.notificationService.markAsRead(
          req.params.id,
          req.user.userId
        );
        res.json(notification);
      } catch (error) {
        next(error);
      }
    },
  ];

  markAllAsRead = [
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const count = await this.notificationService.markAllAsRead(req.user.userId);
        res.json({ count });
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

        await this.notificationService.delete(req.params.id, req.user.userId);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  ];
}