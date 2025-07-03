import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';

export const commentRouter = Router();
const commentController = new CommentController();

// Comment routes
commentRouter.post('/', commentController.create);
commentRouter.get('/task/:taskId', commentController.listByTask);
commentRouter.put('/:id', commentController.update);
commentRouter.delete('/:id', commentController.delete);