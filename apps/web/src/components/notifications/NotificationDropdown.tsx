import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Menu, Indicator, Button, Text, ScrollArea, ActionIcon, Group, Divider, Loader } from '@mantine/core';
import { IconBell, IconCheck } from '@tabler/icons-react';
import { notifications as notifyToast } from '@mantine/notifications';
import { notificationService } from '../../services/notification';
import { NotificationItem } from './NotificationItem';
import { socket } from '../../services/socket';

export function NotificationDropdown(): JSX.Element {
  const [opened, setOpened] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.list({ limit: 10, unreadOnly: false }),
    refetchInterval: 60000, // Refetch every minute
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      notifyToast.show({
        title: 'Success',
        message: 'All notifications marked as read',
        color: 'green',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Listen for real-time notifications
  useEffect(() => {
    const handleNewNotification = (notification: any): void => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      notifyToast.show({
        title: notification.title,
        message: notification.message,
        color: 'blue',
      });
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:read', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
    socket.on('notification:allRead', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
    socket.on('notification:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:read');
      socket.off('notification:allRead');
      socket.off('notification:deleted');
    };
  }, [queryClient]);

  const unreadCount = data?.unread || 0;
  const notifications = data?.items || [];

  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      width={400}
      position="bottom-end"
      transitionProps={{ transition: 'pop' }}
    >
      <Menu.Target>
        <Indicator inline label={unreadCount} size={16} disabled={unreadCount === 0}>
          <ActionIcon size="lg" variant="subtle">
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown>
        <Group position="apart" px="xs" py="sm">
          <Text weight={600}>Notifications</Text>
          {unreadCount > 0 && (
            <Button
              size="xs"
              variant="subtle"
              leftIcon={<IconCheck size={14} />}
              onClick={() => markAllAsReadMutation.mutate()}
              loading={markAllAsReadMutation.isLoading}
            >
              Mark all read
            </Button>
          )}
        </Group>

        <Divider />

        <ScrollArea h={400}>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader size="sm" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Text color="dimmed" size="sm">
                No notifications yet
              </Text>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Divider />
            <div className="p-2">
              <Button
                fullWidth
                variant="subtle"
                size="sm"
                onClick={() => {
                  setOpened(false);
                  // Navigate to notifications page
                  window.location.href = '/notifications';
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}