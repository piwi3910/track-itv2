import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';

export const notificationRouter = Router();
const notificationController = new NotificationController();

// Notification routes
notificationRouter.get('/', notificationController.list);
notificationRouter.put('/:id/read', notificationController.markAsRead);
notificationRouter.put('/read-all', notificationController.markAllAsRead);
notificationRouter.delete('/:id', notificationController.delete);