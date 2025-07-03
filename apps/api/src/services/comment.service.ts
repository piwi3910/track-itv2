import { Comment } from '@track-it/database';
import { getDatabase } from './database';
import { AppError } from '../middleware/errorHandler';
import { ProjectService } from './project.service';
import { emitToTask } from './socket';

interface CreateCommentData {
  content: string;
  taskId: string;
}

interface UpdateCommentData {
  content: string;
}

export class CommentService {
  private db = getDatabase();
  private projectService = new ProjectService();

  async create(data: CreateCommentData, userId: string): Promise<Comment> {
    // Verify task exists and user has access
    const task = await this.db.task.findUnique({
      where: { id: data.taskId },
      select: { projectId: true },
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    // Check user has access to the project
    await this.projectService.checkProjectPermission(task.projectId, userId, ['OWNER', 'ADMIN', 'MEMBER']);

    const comment = await this.db.comment.create({
      data: {
        content: data.content,
        taskId: data.taskId,
        userId,
      },
      include: {
        user: {
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
        type: 'COMMENT_ADDED',
        description: 'Added a comment',
        taskId: data.taskId,
        userId,
        metadata: { commentId: comment.id },
      },
    });

    // Emit real-time update
    emitToTask(data.taskId, 'comment:created', comment);

    // Check for mentions and create notifications
    await this.checkMentions(comment.content, data.taskId, userId);

    return comment;
  }

  async findByTask(taskId: string, userId: string): Promise<Comment[]> {
    // Verify user has access to the task
    const task = await this.db.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    await this.projectService.checkProjectPermission(task.projectId, userId, ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);

    const comments = await this.db.comment.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return comments;
  }

  async update(commentId: string, data: UpdateCommentData, userId: string): Promise<Comment> {
    const comment = await this.db.comment.findUnique({
      where: { id: commentId },
      include: { task: { select: { projectId: true } } },
    });

    if (!comment) {
      throw new AppError(404, 'Comment not found');
    }

    // Only comment author can update
    if (comment.userId !== userId) {
      throw new AppError(403, 'You can only edit your own comments');
    }

    const updatedComment = await this.db.comment.update({
      where: { id: commentId },
      data: { content: data.content },
      include: {
        user: {
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
        type: 'COMMENT_UPDATED',
        description: 'Updated a comment',
        taskId: comment.taskId,
        userId,
        metadata: { commentId: comment.id },
      },
    });

    // Emit real-time update
    emitToTask(comment.taskId, 'comment:updated', updatedComment);

    return updatedComment;
  }

  async delete(commentId: string, userId: string): Promise<void> {
    const comment = await this.db.comment.findUnique({
      where: { id: commentId },
      include: { task: { select: { projectId: true } } },
    });

    if (!comment) {
      throw new AppError(404, 'Comment not found');
    }

    // Check permissions - comment author or project admin/owner can delete
    if (comment.userId !== userId) {
      const userRole = await this.projectService.getUserRole(comment.task.projectId, userId);
      if (!userRole || !['OWNER', 'ADMIN'].includes(userRole)) {
        throw new AppError(403, 'Insufficient permissions to delete this comment');
      }
    }

    await this.db.comment.delete({
      where: { id: commentId },
    });

    // Create activity
    await this.db.activity.create({
      data: {
        type: 'COMMENT_DELETED',
        description: 'Deleted a comment',
        taskId: comment.taskId,
        userId,
      },
    });

    // Emit real-time update
    emitToTask(comment.taskId, 'comment:deleted', { id: commentId });
  }

  private async checkMentions(content: string, taskId: string, authorId: string): Promise<void> {
    // Extract @mentions from content
    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex);

    if (!mentions) return;

    // Get task details
    const task = await this.db.task.findUnique({
      where: { id: taskId },
      select: { title: true, projectId: true },
    });

    if (!task) return;

    // Find mentioned users
    const usernames = mentions.map(m => m.substring(1));
    const users = await this.db.user.findMany({
      where: {
        OR: usernames.map(username => ({
          email: { contains: username, mode: 'insensitive' },
        })),
      },
    });

    // Create notifications for mentioned users
    for (const user of users) {
      if (user.id !== authorId) {
        await this.db.notification.create({
          data: {
            type: 'COMMENT_MENTION',
            title: 'You were mentioned in a comment',
            message: `You were mentioned in a comment on task "${task.title}"`,
            userId: user.id,
            metadata: { taskId, commentId: authorId },
          },
        });
      }
    }
  }
}