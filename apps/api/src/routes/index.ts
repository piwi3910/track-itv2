import { Application } from 'express';
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { projectRouter } from './project.routes';
import { taskRouter } from './task.routes';

export function setupRoutes(app: Application): void {
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/projects', projectRouter);
  app.use('/api/tasks', taskRouter);
}