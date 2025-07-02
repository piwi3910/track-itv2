import { Router } from 'express';

export const taskRouter = Router();

// Placeholder routes - will be implemented
taskRouter.get('/', (_req, res) => {
  res.json({ message: 'List tasks endpoint - to be implemented' });
});

taskRouter.post('/', (_req, res) => {
  res.json({ message: 'Create task endpoint - to be implemented' });
});

taskRouter.get('/:id', (_req, res) => {
  res.json({ message: 'Get task endpoint - to be implemented' });
});

taskRouter.put('/:id', (_req, res) => {
  res.json({ message: 'Update task endpoint - to be implemented' });
});

taskRouter.delete('/:id', (_req, res) => {
  res.json({ message: 'Delete task endpoint - to be implemented' });
});