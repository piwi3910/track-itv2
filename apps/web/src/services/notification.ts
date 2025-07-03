import { api } from './api';
import { Notification } from '@track-it/shared';

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  unread: number;
}

class NotificationService {
  async list(options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationListResponse> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.unreadOnly) params.append('unreadOnly', 'true');

    const response = await api.get<NotificationListResponse>(`/notifications?${params}`);
    return response.data;
  }

  async markAsRead(id: string): Promise<Notification> {
    const response = await api.put<Notification>(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllAsRead(): Promise<{ count: number }> {
    const response = await api.put<{ count: number }>('/notifications/read-all');
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'COMMENT_MENTION':
        return '💬';
      case 'TASK_ASSIGNED':
        return '📋';
      case 'TASK_DUE_SOON':
        return '⏰';
      case 'PROJECT_INVITATION':
        return '📨';
      case 'PROJECT_ROLE_CHANGED':
        return '👥';
      case 'TASK_COMPLETED':
        return '✅';
      default:
        return '🔔';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'COMMENT_MENTION':
        return 'blue';
      case 'TASK_ASSIGNED':
        return 'green';
      case 'TASK_DUE_SOON':
        return 'orange';
      case 'PROJECT_INVITATION':
        return 'purple';
      case 'PROJECT_ROLE_CHANGED':
        return 'indigo';
      case 'TASK_COMPLETED':
        return 'teal';
      default:
        return 'gray';
    }
  }
}

export const notificationService = new NotificationService();