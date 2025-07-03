import { Notification } from '@track-it/shared';
import { Paper, Group, Text, ActionIcon, Badge } from '@mantine/core';
import { IconCheck, IconTrash } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { notificationService } from '../../services/notification';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps): JSX.Element {
  const handleClick = (): void => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Paper
      p="sm"
      withBorder
      className={`cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
      onClick={handleClick}
    >
      <Group position="apart" align="flex-start">
        <Group align="flex-start" spacing="sm">
          <Text size="xl">{notificationService.getNotificationIcon(notification.type)}</Text>
          <div className="flex-1">
            <Group spacing="xs">
              <Text size="sm" weight={600}>
                {notification.title}
              </Text>
              {!notification.isRead && (
                <Badge size="xs" variant="dot" color="blue">
                  New
                </Badge>
              )}
            </Group>
            <Text size="sm" color="dimmed" className="mt-1">
              {notification.message}
            </Text>
            <Text size="xs" color="dimmed" className="mt-2">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </Text>
          </div>
        </Group>
        <Group spacing="xs">
          {!notification.isRead && (
            <ActionIcon size="sm" onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.id); }}>
              <IconCheck size={16} />
            </ActionIcon>
          )}
          <ActionIcon size="sm" color="red" onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
}