import { Router } from 'express';
import { AttachmentController } from '../controllers/attachment.controller';

export const attachmentRouter = Router();
const attachmentController = new AttachmentController();

// Attachment routes
attachmentRouter.post('/upload', attachmentController.upload);
attachmentRouter.get('/task/:taskId', attachmentController.listByTask);
attachmentRouter.get('/:id/download', attachmentController.download);
attachmentRouter.delete('/:id', attachmentController.delete);