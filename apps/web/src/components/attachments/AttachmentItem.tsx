import { Attachment } from '@track-it/shared';
import { Group, Text, ActionIcon, Paper } from '@mantine/core';
import { IconDownload, IconTrash } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { attachmentService } from '../../services/attachment';
import { useAuth } from '../../contexts/AuthContext';

interface AttachmentItemProps {
  attachment: Attachment;
  onDelete: (id: string) => void;
}

export function AttachmentItem({ attachment, onDelete }: AttachmentItemProps): JSX.Element {
  const { user } = useAuth();

  const handleDownload = (): void => {
    attachmentService.download(attachment.id);
  };

  const canDelete = user?.id === attachment.uploadedById || ['OWNER', 'ADMIN'].includes(user?.role || '');

  return (
    <Paper p="sm" withBorder className="hover:shadow-sm transition-shadow">
      <Group position="apart">
        <Group>
          <Text size="xl">{attachmentService.getFileIcon(attachment.mimeType)}</Text>
          <div>
            <Text size="sm" weight={500} lineClamp={1}>
              {attachment.originalName}
            </Text>
            <Group spacing="xs">
              <Text size="xs" color="dimmed">
                {attachmentService.formatFileSize(attachment.size)}
              </Text>
              <Text size="xs" color="dimmed">
                •
              </Text>
              <Text size="xs" color="dimmed">
                {formatDistanceToNow(new Date(attachment.uploadedAt), { addSuffix: true })}
              </Text>
              <Text size="xs" color="dimmed">
                by {attachment.uploadedBy.firstName} {attachment.uploadedBy.lastName}
              </Text>
            </Group>
          </div>
        </Group>
        <Group spacing="xs">
          <ActionIcon onClick={handleDownload} title="Download">
            <IconDownload size={18} />
          </ActionIcon>
          {canDelete && (
            <ActionIcon color="red" onClick={() => onDelete(attachment.id)} title="Delete">
              <IconTrash size={18} />
            </ActionIcon>
          )}
        </Group>
      </Group>
    </Paper>
  );
}