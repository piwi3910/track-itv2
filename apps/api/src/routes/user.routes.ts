import { Router } from 'express';

export const userRouter = Router();

// Placeholder routes - will be implemented
userRouter.get('/', (_req, res) => {
  res.json({ message: 'List users endpoint - to be implemented' });
});

userRouter.get('/:id', (_req, res) => {
  res.json({ message: 'Get user endpoint - to be implemented' });
});

userRouter.put('/:id', (_req, res) => {
  res.json({ message: 'Update user endpoint - to be implemented' });
});