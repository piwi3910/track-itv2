import { Request, Response, NextFunction } from 'express';
import { loginSchema, registerSchema } from '@track-it/shared';
import { AuthService } from '../services/auth.service';
import { validateBody } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

export class AuthController {
  private authService = new AuthService();

  login = [
    validateBody(loginSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const result = await this.authService.login(req.body);
        res.json(result);
      } catch (error) {
        next(error);
      }
    },
  ];

  register = [
    validateBody(registerSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const result = await this.authService.register(req.body);
        res.status(201).json(result);
      } catch (error) {
        next(error);
      }
    },
  ];

  getCurrentUser = [
    authenticateToken,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }
        const user = await this.authService.getCurrentUser(req.user.userId);
        res.json(user);
      } catch (error) {
        next(error);
      }
    },
  ];

  logout = async (req: Request, res: Response): Promise<void> => {
    // For JWT-based auth, logout is handled client-side by removing the token
    // If using sessions in the future, we would destroy the session here
    res.json({ message: 'Logged out successfully' });
  };
}