import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, Loader, Paper, Text, Group, Badge, ActionIcon, Box } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { searchService } from '../../services/search';
import { taskUtils } from '@track-it/shared';

export function SearchBar(): JSX.Element {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchService.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (type: string, id: string): void => {
    setQuery('');
    setIsOpen(false);
    
    switch (type) {
      case 'project':
        navigate(`/projects/${id}`);
        break;
      case 'task':
        navigate(`/tasks?id=${id}`);
        break;
      case 'user':
        navigate(`/users/${id}`);
        break;
    }
  };

  const hasResults = data && (
    (data.projects && data.projects.length > 0) ||
    (data.tasks && data.tasks.length > 0) ||
    (data.users && data.users.length > 0)
  );

  return (
    <Box className="relative w-full max-w-md" ref={searchRef}>
      <TextInput
        placeholder="Search projects, tasks, or users..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        leftSection={<IconSearch size={18} />}
        rightSection={
          query ? (
            <ActionIcon size="sm" onClick={() => setQuery('')} variant="subtle">
              <IconX size={16} />
            </ActionIcon>
          ) : isLoading ? (
            <Loader size="sm" />
          ) : null
        }
      />

      {isOpen && query.length >= 2 && (
        <Paper
          className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto z-50"
          shadow="md"
          p="sm"
          withBorder
        >
          {isLoading ? (
            <div className="text-center py-4">
              <Loader size="sm" />
            </div>
          ) : hasResults ? (
            <div className="space-y-4">
              {/* Projects */}
              {data.projects && data.projects.length > 0 && (
                <div>
                  <Text size="xs" weight={600} color="dimmed" mb="xs">
                    PROJECTS
                  </Text>
                  <div className="space-y-2">
                    {data.projects.map((project: any) => (
                      <div
                        key={project.id}
                        className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => handleResultClick('project', project.id)}
                      >
                        <Text size="sm" weight={500}>
                          {project.name}
                        </Text>
                        {project.description && (
                          <Text size="xs" color="dimmed" lineClamp={1}>
                            {project.description}
                          </Text>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {data.tasks && data.tasks.length > 0 && (
                <div>
                  <Text size="xs" weight={600} color="dimmed" mb="xs">
                    TASKS
                  </Text>
                  <div className="space-y-2">
                    {data.tasks.map((task: any) => (
                      <div
                        key={task.id}
                        className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => handleResultClick('task', task.id)}
                      >
                        <Group position="apart">
                          <Text size="sm" weight={500} style={{ flex: 1 }}>
                            {task.title}
                          </Text>
                          <Group spacing="xs">
                            <Badge size="xs" color={taskUtils.getStatusColor(task.status)}>
                              {taskUtils.getStatusLabel(task.status)}
                            </Badge>
                            {task.priority && (
                              <Badge size="xs" color={taskUtils.getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            )}
                          </Group>
                        </Group>
                        <Text size="xs" color="dimmed">
                          {task.project.name}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {data.users && data.users.length > 0 && (
                <div>
                  <Text size="xs" weight={600} color="dimmed" mb="xs">
                    USERS
                  </Text>
                  <div className="space-y-2">
                    {data.users.map((user: any) => (
                      <div
                        key={user.id}
                        className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => handleResultClick('user', user.id)}
                      >
                        <Text size="sm" weight={500}>
                          {user.firstName} {user.lastName}
                        </Text>
                        <Text size="xs" color="dimmed">
                          {user.email}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <Text
                  size="xs"
                  color="primary"
                  className="cursor-pointer hover:underline text-center"
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                  }}
                >
                  View all results →
                </Text>
              </div>
            </div>
          ) : (
            <Text size="sm" color="dimmed" className="text-center py-4">
              No results found for "{query}"
            </Text>
          )}
        </Paper>
      )}
    </Box>
  );
}