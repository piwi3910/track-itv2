import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Group, Stack, Text, FileButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUpload } from '@tabler/icons-react';
import { attachmentService } from '../../services/attachment';
import { AttachmentItem } from './AttachmentItem';
import { useAuth } from '../../contexts/AuthContext';

interface AttachmentListProps {
  taskId: string;
}

export function AttachmentList({ taskId }: AttachmentListProps): JSX.Element {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const resetRef = useRef<() => void>(null);

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['attachments', taskId],
    queryFn: () => attachmentService.listByTask(taskId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => attachmentService.upload({ file, taskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
      resetRef.current?.();
      notifications.show({
        title: 'Success',
        message: 'File uploaded successfully',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to upload file',
        color: 'red',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: attachmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
      notifications.show({
        title: 'Success',
        message: 'Attachment deleted successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete attachment',
        color: 'red',
      });
    },
  });

  const handleFileUpload = (file: File | null): void => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  if (isLoading) {
    return <Text>Loading attachments...</Text>;
  }

  return (
    <Box>
      <Group position="apart" mb="md">
        <Text size="lg" weight={600}>
          Attachments ({attachments.length})
        </Text>
        {user && (
          <FileButton
            resetRef={resetRef}
            onChange={handleFileUpload}
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
          >
            {(props) => (
              <Button
                {...props}
                leftIcon={<IconUpload size={16} />}
                loading={uploadMutation.isLoading}
                size="sm"
              >
                Upload File
              </Button>
            )}
          </FileButton>
        )}
      </Group>

      <Stack spacing="sm">
        {attachments.length === 0 ? (
          <Text color="dimmed" size="sm">
            No attachments yet. Upload files to attach them to this task.
          </Text>
        ) : (
          attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))
        )}
      </Stack>
    </Box>
  );
}