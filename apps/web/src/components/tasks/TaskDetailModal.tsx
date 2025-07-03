import { Modal, Tabs, Box, Text, Badge, Group, Stack } from '@mantine/core';
import { Task } from '@track-it/shared';
import { format } from 'date-fns';
import { IconMessage, IconPaperclip, IconInfoCircle } from '@tabler/icons-react';
import { CommentList } from '../comments/CommentList';
import { AttachmentList } from '../attachments/AttachmentList';
import { taskUtils } from '@track-it/shared';

interface TaskDetailModalProps {
  task: Task | null;
  opened: boolean;
  onClose: () => void;
}

export function TaskDetailModal({ task, opened, onClose }: TaskDetailModalProps): JSX.Element {
  if (!task) return <></>;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      title={
        <Group>
          <Text size="lg" weight={600}>
            {task.title}
          </Text>
          <Badge color={taskUtils.getStatusColor(task.status)} size="sm">
            {taskUtils.getStatusLabel(task.status)}
          </Badge>
          {task.priority && (
            <Badge color={taskUtils.getPriorityColor(task.priority)} size="sm">
              {taskUtils.getPriorityLabel(task.priority)}
            </Badge>
          )}
        </Group>
      }
    >
      <Tabs defaultValue="details">
        <Tabs.List>
          <Tabs.Tab value="details" icon={<IconInfoCircle size={16} />}>
            Details
          </Tabs.Tab>
          <Tabs.Tab value="comments" icon={<IconMessage size={16} />}>
            Comments
          </Tabs.Tab>
          <Tabs.Tab value="attachments" icon={<IconPaperclip size={16} />}>
            Attachments
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="details" pt="md">
          <Stack spacing="md">
            {task.description && (
              <Box>
                <Text size="sm" weight={600} mb="xs">
                  Description
                </Text>
                <Text size="sm" color="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                  {task.description}
                </Text>
              </Box>
            )}

            <Group grow>
              <Box>
                <Text size="sm" weight={600} mb="xs">
                  Created
                </Text>
                <Text size="sm" color="dimmed">
                  {format(new Date(task.createdAt), 'PPP')}
                </Text>
              </Box>

              {task.dueDate && (
                <Box>
                  <Text size="sm" weight={600} mb="xs">
                    Due Date
                  </Text>
                  <Text size="sm" color="dimmed">
                    {format(new Date(task.dueDate), 'PPP')}
                  </Text>
                </Box>
              )}
            </Group>

            {task.assignee && (
              <Box>
                <Text size="sm" weight={600} mb="xs">
                  Assigned To
                </Text>
                <Text size="sm" color="dimmed">
                  {task.assignee.firstName} {task.assignee.lastName} ({task.assignee.email})
                </Text>
              </Box>
            )}

            <Box>
              <Text size="sm" weight={600} mb="xs">
                Project
              </Text>
              <Text size="sm" color="dimmed">
                {task.project.name}
              </Text>
            </Box>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="comments" pt="md">
          <CommentList taskId={task.id} />
        </Tabs.Panel>

        <Tabs.Panel value="attachments" pt="md">
          <AttachmentList taskId={task.id} />
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}