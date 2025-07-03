import { Application } from 'express';
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { projectRouter } from './project.routes';
import { taskRouter } from './task.routes';
import { commentRouter } from './comment.routes';
import { attachmentRouter } from './attachment.routes';
import { searchRouter } from './search.routes';

export function setupRoutes(app: Application): void {
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/projects', projectRouter);
  app.use('/api/tasks', taskRouter);
  app.use('/api/comments', commentRouter);
  app.use('/api/attachments', attachmentRouter);
  app.use('/api/search', searchRouter);
}