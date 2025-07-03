import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserService } from '../services/user.service';
import { validateBody } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../config/upload';
import { AppError } from '../middleware/errorHandler';

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  emailNotifications: z.boolean().optional(),
  mentionNotifications: z.boolean().optional(),
  taskNotifications: z.boolean().optional(),
  projectNotifications: z.boolean().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6).max(100),
});

export class UserController {
  private userService = new UserService();

  getProfile = [
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const user = await this.userService.findById(req.user.userId);
        if (!user) {
          res.status(404).json({ message: 'User not found' });
          return;
        }

        res.json(user);
      } catch (error) {
        next(error);
      }
    },
  ];

  updateProfile = [
    authenticateToken,
    validateBody(updateProfileSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const user = await this.userService.updateProfile(req.user.userId, req.body);
        res.json(user);
      } catch (error) {
        next(error);
      }
    },
  ];

  changePassword = [
    authenticateToken,
    validateBody(changePasswordSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        await this.userService.changePassword(req.user.userId, req.body);
        res.json({ message: 'Password changed successfully' });
      } catch (error) {
        next(error);
      }
    },
  ];

  uploadAvatar = [
    authenticateToken,
    upload.single('avatar'),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        if (!req.file) {
          throw new AppError(400, 'No file uploaded');
        }

        // Validate file is an image
        if (!req.file.mimetype.startsWith('image/')) {
          throw new AppError(400, 'File must be an image');
        }

        const user = await this.userService.updateAvatar(req.user.userId, {
          filename: req.file.filename,
          path: req.file.path,
        });

        res.json(user);
      } catch (error) {
        next(error);
      }
    },
  ];

  deleteAvatar = [
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const user = await this.userService.deleteAvatar(req.user.userId);
        res.json(user);
      } catch (error) {
        next(error);
      }
    },
  ];

  getStats = [
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const stats = await this.userService.getUserStats(req.user.userId);
        res.json(stats);
      } catch (error) {
        next(error);
      }
    },
  ];
}