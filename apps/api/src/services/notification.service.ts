import { Notification, NotificationType } from '@track-it/database';
import { getDatabase } from './database';
import { emitToUser } from './socket';
import { queueService } from './queue.service';

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  mentionNotifications: boolean;
  taskAssignmentNotifications: boolean;
  dueDateNotifications: boolean;
  projectUpdateNotifications: boolean;
}

export class NotificationService {
  private db = getDatabase();

  async create(data: CreateNotificationData): Promise<Notification> {
    const notification = await this.db.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        userId: data.userId,
        metadata: data.metadata || {},
      },
    });

    // Emit real-time notification
    emitToUser(data.userId, 'notification:new', notification);

    // Queue email notification if enabled
    const preferences = await this.getUserPreferences(data.userId);
    if (preferences.emailEnabled && this.shouldSendEmail(data.type, preferences)) {
      await queueService.addEmailJob({
        to: data.userId,
        type: 'notification',
        subject: data.title,
        data: {
          title: data.title,
          message: data.message,
          metadata: data.metadata,
        },
      });
    }

    return notification;
  }

  async findByUser(userId: string, options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  } = {}): Promise<{ items: Notification[]; total: number; unread: number }> {
    const { limit = 20, offset = 0, unreadOnly = false } = options;

    const where = {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    };

    const [items, total, unread] = await Promise.all([
      this.db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.db.notification.count({ where }),
      this.db.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { items, total, unread };
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const updated = await this.db.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Emit update
    emitToUser(userId, 'notification:read', { id: notificationId });

    return updated;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.db.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Emit update
    emitToUser(userId, 'notification:allRead', {});

    return result.count;
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    const notification = await this.db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await this.db.notification.delete({
      where: { id: notificationId },
    });

    // Emit update
    emitToUser(userId, 'notification:deleted', { id: notificationId });
  }

  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    // In a real app, this would fetch from user preferences table
    // For now, return default preferences
    return {
      emailEnabled: true,
      mentionNotifications: true,
      taskAssignmentNotifications: true,
      dueDateNotifications: true,
      projectUpdateNotifications: true,
    };
  }

  private shouldSendEmail(type: NotificationType, preferences: NotificationPreferences): boolean {
    switch (type) {
      case 'COMMENT_MENTION':
        return preferences.mentionNotifications;
      case 'TASK_ASSIGNED':
        return preferences.taskAssignmentNotifications;
      case 'TASK_DUE_SOON':
        return preferences.dueDateNotifications;
      case 'PROJECT_INVITATION':
      case 'PROJECT_ROLE_CHANGED':
        return preferences.projectUpdateNotifications;
      default:
        return true;
    }
  }

  // Notification creators for different events
  async notifyTaskAssignment(taskId: string, assigneeId: string, assignerId: string): Promise<void> {
    const task = await this.db.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { name: true } },
        assignee: { select: { firstName: true, lastName: true } },
      },
    });

    if (!task) return;

    const assigner = await this.db.user.findUnique({
      where: { id: assignerId },
      select: { firstName: true, lastName: true },
    });

    await this.create({
      type: 'TASK_ASSIGNED',
      title: 'New Task Assignment',
      message: `${assigner?.firstName} ${assigner?.lastName} assigned you to task "${task.title}" in project ${task.project.name}`,
      userId: assigneeId,
      metadata: { taskId, projectId: task.projectId },
    });
  }

  async notifyTaskDueSoon(taskId: string): Promise<void> {
    const task = await this.db.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { name: true } },
        assignee: true,
      },
    });

    if (!task || !task.assignee || !task.dueDate) return;

    await this.create({
      type: 'TASK_DUE_SOON',
      title: 'Task Due Soon',
      message: `Task "${task.title}" in project ${task.project.name} is due soon`,
      userId: task.assignee.id,
      metadata: { taskId, projectId: task.projectId, dueDate: task.dueDate },
    });
  }

  async notifyProjectInvitation(projectId: string, userId: string, role: string, inviterId: string): Promise<void> {
    const [project, inviter] = await Promise.all([
      this.db.project.findUnique({
        where: { id: projectId },
        select: { name: true },
      }),
      this.db.user.findUnique({
        where: { id: inviterId },
        select: { firstName: true, lastName: true },
      }),
    ]);

    if (!project || !inviter) return;

    await this.create({
      type: 'PROJECT_INVITATION',
      title: 'Project Invitation',
      message: `${inviter.firstName} ${inviter.lastName} invited you to join project "${project.name}" as ${role}`,
      userId,
      metadata: { projectId, role },
    });
  }
}