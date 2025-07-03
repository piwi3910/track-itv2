import { Attachment } from '@track-it/database';
import { getDatabase } from './database';
import { AppError } from '../middleware/errorHandler';
import { ProjectService } from './project.service';
import { deleteFile, getFileUrl } from '../config/upload';
import { emitToTask } from './socket';

interface CreateAttachmentData {
  taskId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
}

export class AttachmentService {
  private db = getDatabase();
  private projectService = new ProjectService();

  async create(data: CreateAttachmentData, userId: string): Promise<Attachment> {
    // Verify task exists and user has access
    const task = await this.db.task.findUnique({
      where: { id: data.taskId },
      select: { projectId: true },
    });

    if (!task) {
      // Clean up uploaded file
      await deleteFile(data.path);
      throw new AppError(404, 'Task not found');
    }

    // Check user has access to the project
    try {
      await this.projectService.checkProjectPermission(task.projectId, userId, ['OWNER', 'ADMIN', 'MEMBER']);
    } catch (error) {
      // Clean up uploaded file
      await deleteFile(data.path);
      throw error;
    }

    const attachment = await this.db.attachment.create({
      data: {
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
        path: data.path,
        url: getFileUrl(data.path),
        taskId: data.taskId,
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Create activity
    await this.db.activity.create({
      data: {
        type: 'ATTACHMENT_ADDED',
        description: `Added attachment: ${data.originalName}`,
        taskId: data.taskId,
        userId,
        metadata: { attachmentId: attachment.id },
      },
    });

    // Emit real-time update
    emitToTask(data.taskId, 'attachment:created', attachment);

    return attachment;
  }

  async findByTask(taskId: string, userId: string): Promise<Attachment[]> {
    // Verify user has access to the task
    const task = await this.db.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    await this.projectService.checkProjectPermission(task.projectId, userId, ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);

    const attachments = await this.db.attachment.findMany({
      where: { taskId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return attachments;
  }

  async delete(attachmentId: string, userId: string): Promise<void> {
    const attachment = await this.db.attachment.findUnique({
      where: { id: attachmentId },
      include: { task: { select: { projectId: true } } },
    });

    if (!attachment) {
      throw new AppError(404, 'Attachment not found');
    }

    // Check permissions - uploader or project admin/owner can delete
    if (attachment.uploadedById !== userId) {
      const userRole = await this.projectService.getUserRole(attachment.task.projectId, userId);
      if (!userRole || !['OWNER', 'ADMIN'].includes(userRole)) {
        throw new AppError(403, 'Insufficient permissions to delete this attachment');
      }
    }

    // Delete from database
    await this.db.attachment.delete({
      where: { id: attachmentId },
    });

    // Delete physical file
    await deleteFile(attachment.path);

    // Create activity
    await this.db.activity.create({
      data: {
        type: 'ATTACHMENT_REMOVED',
        description: `Removed attachment: ${attachment.originalName}`,
        taskId: attachment.taskId,
        userId,
      },
    });

    // Emit real-time update
    emitToTask(attachment.taskId, 'attachment:deleted', { id: attachmentId });
  }

  async getDownloadInfo(attachmentId: string, userId: string): Promise<{ path: string; filename: string; mimeType: string }> {
    const attachment = await this.db.attachment.findUnique({
      where: { id: attachmentId },
      include: { task: { select: { projectId: true } } },
    });

    if (!attachment) {
      throw new AppError(404, 'Attachment not found');
    }

    // Check user has access to view
    await this.projectService.checkProjectPermission(attachment.task.projectId, userId, ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);

    return {
      path: attachment.path,
      filename: attachment.originalName,
      mimeType: attachment.mimeType,
    };
  }
}