import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

export const userRouter = Router();
const userController = new UserController();

// User profile routes
userRouter.get('/profile', userController.getProfile);
userRouter.put('/profile', userController.updateProfile);
userRouter.put('/profile/password', userController.changePassword);
userRouter.post('/profile/avatar', userController.uploadAvatar);
userRouter.delete('/profile/avatar', userController.deleteAvatar);
userRouter.get('/profile/stats', userController.getStats);