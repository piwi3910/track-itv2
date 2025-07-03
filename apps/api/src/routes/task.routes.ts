import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';

export const taskRouter = Router();
const taskController = new TaskController();

// Task CRUD routes
taskRouter.get('/', taskController.list);
taskRouter.post('/', taskController.create);
taskRouter.get('/:id', taskController.get);
taskRouter.put('/:id', taskController.update);
taskRouter.delete('/:id', taskController.delete);

// Task specific actions
taskRouter.put('/:id/position', taskController.updatePosition);