import { Router } from 'express';

export const projectRouter = Router();

// Placeholder routes - will be implemented
projectRouter.get('/', (_req, res) => {
  res.json({ message: 'List projects endpoint - to be implemented' });
});

projectRouter.post('/', (_req, res) => {
  res.json({ message: 'Create project endpoint - to be implemented' });
});

projectRouter.get('/:id', (_req, res) => {
  res.json({ message: 'Get project endpoint - to be implemented' });
});

projectRouter.put('/:id', (_req, res) => {
  res.json({ message: 'Update project endpoint - to be implemented' });
});

projectRouter.delete('/:id', (_req, res) => {
  res.json({ message: 'Delete project endpoint - to be implemented' });
});