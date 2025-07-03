import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import path from 'path';
import { AttachmentService } from '../services/attachment.service';
import { validateParams } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { idParamSchema } from '@track-it/shared';
import { upload } from '../config/upload';
import { AppError } from '../middleware/errorHandler';

const taskIdParamSchema = z.object({
  taskId: z.string().cuid(),
});

export class AttachmentController {
  private attachmentService = new AttachmentService();

  upload = [
    authenticateToken,
    upload.single('file'),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        if (!req.file) {
          throw new AppError(400, 'No file uploaded');
        }

        const { taskId } = req.body;
        if (!taskId) {
          throw new AppError(400, 'Task ID is required');
        }

        const attachment = await this.attachmentService.create(
          {
            taskId,
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
          },
          req.user.userId
        );

        res.status(201).json(attachment);
      } catch (error) {
        next(error);
      }
    },
  ];

  listByTask = [
    authenticateToken,
    validateParams(taskIdParamSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const { taskId } = req.params;
        const attachments = await this.attachmentService.findByTask(taskId, req.user.userId);
        res.json(attachments);
      } catch (error) {
        next(error);
      }
    },
  ];

  download = [
    authenticateToken,
    validateParams(idParamSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const { id } = req.params;
        const { path: filePath, filename, mimeType } = await this.attachmentService.getDownloadInfo(
          id,
          req.user.userId
        );

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.sendFile(path.resolve(filePath));
      } catch (error) {
        next(error);
      }
    },
  ];

  delete = [
    authenticateToken,
    validateParams(idParamSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        await this.attachmentService.delete(req.params.id, req.user.userId);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  ];
}