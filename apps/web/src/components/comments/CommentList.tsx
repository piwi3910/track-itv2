import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Comment } from '@track-it/shared';
import { Button, Textarea, Text, Box, Group, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSend } from '@tabler/icons-react';
import { commentService } from '../../services/comment';
import { CommentItem } from './CommentItem';
import { useAuth } from '../../contexts/AuthContext';

interface CommentListProps {
  taskId: string;
}

export function CommentList({ taskId }: CommentListProps): JSX.Element {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => commentService.listByTask(taskId),
  });

  const createMutation = useMutation({
    mutationFn: (content: string) => commentService.create({ content, taskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setNewComment('');
      notifications.show({
        title: 'Success',
        message: 'Comment added successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to add comment',
        color: 'red',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      commentService.update(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      notifications.show({
        title: 'Success',
        message: 'Comment updated successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update comment',
        color: 'red',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: commentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      notifications.show({
        title: 'Success',
        message: 'Comment deleted successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete comment',
        color: 'red',
      });
    },
  });

  const handleSubmit = (): void => {
    if (newComment.trim()) {
      createMutation.mutate(newComment);
    }
  };

  if (isLoading) {
    return <Text>Loading comments...</Text>;
  }

  return (
    <Box>
      <Text size="lg" weight={600} mb="md">
        Comments ({comments.length})
      </Text>

      <Stack spacing="sm">
        {comments.length === 0 ? (
          <Text color="dimmed" size="sm">
            No comments yet. Be the first to comment!
          </Text>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onUpdate={(id, content) => updateMutation.mutate({ id, content })}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))
        )}
      </Stack>

      {user && (
        <Box mt="lg">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            minRows={3}
            maxRows={10}
            autosize
          />
          <Group position="right" mt="sm">
            <Button
              leftIcon={<IconSend size={16} />}
              onClick={handleSubmit}
              loading={createMutation.isLoading}
              disabled={!newComment.trim()}
            >
              Post Comment
            </Button>
          </Group>
        </Box>
      )}
    </Box>
  );
}