import { Router } from 'express';
import { authRateLimiter } from '../middleware/rateLimiter';
import { AuthController } from '../controllers/auth.controller';

export const authRouter = Router();
const authController = new AuthController();

authRouter.post('/login', authRateLimiter, authController.login);
authRouter.post('/register', authRateLimiter, authController.register);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authController.getCurrentUser);