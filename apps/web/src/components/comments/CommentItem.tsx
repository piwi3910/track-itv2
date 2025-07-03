import { useState } from 'react';
import { Comment } from '@track-it/shared';
import { formatDistanceToNow } from 'date-fns';
import { Button, TextInput, ActionIcon, Group, Text, Avatar, Box, Textarea } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';

interface CommentItemProps {
  comment: Comment;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export function CommentItem({ comment, onUpdate, onDelete }: CommentItemProps): JSX.Element {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleSave = (): void => {
    if (editContent.trim() && editContent !== comment.content) {
      onUpdate(comment.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancel = (): void => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const canEdit = user?.id === comment.userId;
  const canDelete = user?.id === comment.userId || ['OWNER', 'ADMIN'].includes(user?.role || '');

  return (
    <Box className="p-4 border rounded-lg bg-gray-50">
      <Group position="apart" align="flex-start">
        <Group align="flex-start">
          <Avatar
            src={comment.user.avatar}
            alt={`${comment.user.firstName} ${comment.user.lastName}`}
            radius="xl"
            size="sm"
          >
            {comment.user.firstName?.[0]}{comment.user.lastName?.[0]}
          </Avatar>
          <div className="flex-1">
            <Group spacing="xs">
              <Text size="sm" weight={500}>
                {comment.user.firstName} {comment.user.lastName}
              </Text>
              <Text size="xs" color="dimmed">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </Text>
              {comment.createdAt !== comment.updatedAt && (
                <Text size="xs" color="dimmed" italic>
                  (edited)
                </Text>
              )}
            </Group>
            {isEditing ? (
              <div className="mt-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  minRows={2}
                  autosize
                  maxRows={10}
                />
                <Group spacing="xs" mt="sm">
                  <Button size="xs" onClick={handleSave}>
                    Save
                  </Button>
                  <Button size="xs" variant="subtle" onClick={handleCancel}>
                    Cancel
                  </Button>
                </Group>
              </div>
            ) : (
              <Text size="sm" className="mt-2 whitespace-pre-wrap">
                {comment.content}
              </Text>
            )}
          </div>
        </Group>
        {!isEditing && (
          <Group spacing="xs">
            {canEdit && (
              <ActionIcon size="sm" onClick={() => setIsEditing(true)}>
                <IconPencil size={16} />
              </ActionIcon>
            )}
            {canDelete && (
              <ActionIcon size="sm" color="red" onClick={() => onDelete(comment.id)}>
                <IconTrash size={16} />
              </ActionIcon>
            )}
          </Group>
        )}
      </Group>
    </Box>
  );
}