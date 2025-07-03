import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Container, Tabs, Card, Group, Text, Badge, Button, Loader } from '@mantine/core';
import { IconChartBar } from '@tabler/icons-react';
import { projectService } from '../services/project';
import { taskService } from '../services/task';
import { TaskCard } from '../components/tasks/TaskCard';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { useState } from 'react';

export function ProjectDetailPage(): JSX.Element {
  const { projectId } = useParams<{ projectId: string }>();
  const [showCreateTask, setShowCreateTask] = useState(false);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getById(projectId!),
    enabled: !!projectId,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => taskService.list({ projectId }),
    enabled: !!projectId,
  });

  if (projectLoading || tasksLoading) {
    return (
      <Container size="xl" py="xl">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader />
        </div>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container size="xl" py="xl">
        <Text>Project not found</Text>
      </Container>
    );
  }

  const tasksByStatus = {
    TODO: tasks?.items.filter(t => t.status === 'TODO') || [],
    IN_PROGRESS: tasks?.items.filter(t => t.status === 'IN_PROGRESS') || [],
    IN_REVIEW: tasks?.items.filter(t => t.status === 'IN_REVIEW') || [],
    DONE: tasks?.items.filter(t => t.status === 'DONE') || [],
  };

  return (
    <Container size="xl" py="xl">
      <Group position="apart" mb="xl">
        <div>
          <Group spacing="sm">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
              style={{ backgroundColor: project.color }}
            >
              {project.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              {project.description && (
                <Text color="dimmed">{project.description}</Text>
              )}
            </div>
          </Group>
        </div>
        <Group>
          <Button
            component={Link}
            to={`/analytics/${project.id}`}
            leftIcon={<IconChartBar size={16} />}
            variant="light"
          >
            View Analytics
          </Button>
          <Button onClick={() => setShowCreateTask(true)}>
            New Task
          </Button>
        </Group>
      </Group>

      <Card mb="xl">
        <Group spacing="xl">
          <div>
            <Text size="sm" color="dimmed">Total Tasks</Text>
            <Text size="xl" weight={700}>{tasks?.total || 0}</Text>
          </div>
          <div>
            <Text size="sm" color="dimmed">Members</Text>
            <Text size="xl" weight={700}>{project._count?.members || 0}</Text>
          </div>
          <div>
            <Text size="sm" color="dimmed">Created</Text>
            <Text size="sm">{new Date(project.createdAt).toLocaleDateString()}</Text>
          </div>
          <div>
            <Text size="sm" color="dimmed">Owner</Text>
            <Text size="sm">{project.owner.firstName} {project.owner.lastName}</Text>
          </div>
        </Group>
      </Card>

      <Tabs defaultValue="board">
        <Tabs.List>
          <Tabs.Tab value="board">Board</Tabs.Tab>
          <Tabs.Tab value="list">List</Tabs.Tab>
          <Tabs.Tab value="members">Members</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="board" pt="xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={status} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                    {status.replace('_', ' ')}
                  </h3>
                  <Badge size="sm" variant="light">
                    {statusTasks.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {statusTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onClick={() => {}} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="list" pt="xl">
          <div className="space-y-3">
            {tasks?.items.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => {}} />
            ))}
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="members" pt="xl">
          <Text color="dimmed">Members management coming soon...</Text>
        </Tabs.Panel>
      </Tabs>

      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onSubmit={async (data) => {
          await taskService.create({ ...data, projectId: project.id });
          setShowCreateTask(false);
        }}
      />
    </Container>
  );
}