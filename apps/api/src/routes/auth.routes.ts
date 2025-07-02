import { Router } from 'express';
import { authRateLimiter } from '../middleware/rateLimiter';

export const authRouter = Router();

// Placeholder routes - will be implemented
authRouter.post('/login', authRateLimiter, (_req, res) => {
  res.json({ message: 'Login endpoint - to be implemented' });
});

authRouter.post('/register', authRateLimiter, (_req, res) => {
  res.json({ message: 'Register endpoint - to be implemented' });
});

authRouter.post('/logout', (_req, res) => {
  res.json({ message: 'Logout endpoint - to be implemented' });
});

authRouter.get('/me', (_req, res) => {
  res.json({ message: 'Current user endpoint - to be implemented' });
});