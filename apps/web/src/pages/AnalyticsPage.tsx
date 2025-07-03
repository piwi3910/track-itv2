import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Tabs,
  Card,
  SimpleGrid,
  Text,
  Progress,
  Select,
  Button,
  Group,
  Paper,
  Box,
  Loader,
  Stack,
  Badge,
  RingProgress,
  ThemeIcon,
} from '@mantine/core';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconUsers,
  IconDownload,
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconProgress,
} from '@tabler/icons-react';
import { analyticsService } from '../services/analytics';
import { projectService } from '../services/project';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export function AnalyticsPage(): JSX.Element {
  const { projectId } = useParams<{ projectId: string }>();
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState<string | null>('overview');

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getById(projectId!),
    enabled: !!projectId,
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['project-metrics', projectId],
    queryFn: () => analyticsService.getProjectMetrics(projectId!),
    enabled: !!projectId,
  });

  const { data: velocity } = useQuery({
    queryKey: ['task-velocity', projectId, dateRange],
    queryFn: () => analyticsService.getTaskVelocity(projectId!, { days: parseInt(dateRange) }),
    enabled: !!projectId,
  });

  const { data: burndown } = useQuery({
    queryKey: ['burndown', projectId, dateRange],
    queryFn: () => analyticsService.getBurndownChart(projectId!, { days: parseInt(dateRange) }),
    enabled: !!projectId,
  });

  const { data: productivity } = useQuery({
    queryKey: ['team-productivity', projectId, dateRange],
    queryFn: () => analyticsService.getTeamProductivity(projectId!, { days: parseInt(dateRange) }),
    enabled: !!projectId,
  });

  const { data: timeline } = useQuery({
    queryKey: ['project-timeline', projectId, dateRange],
    queryFn: () => analyticsService.getProjectTimeline(projectId!, parseInt(dateRange)),
    enabled: !!projectId,
  });

  if (!projectId) {
    return <Container>Project ID is required</Container>;
  }

  if (metricsLoading) {
    return (
      <Container size="xl" py="xl">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader />
        </div>
      </Container>
    );
  }

  const handleExport = (data: any[], filename: string): void => {
    analyticsService.exportToCSV(data, filename);
  };

  const priorityData = metrics ? [
    { name: 'Low', value: metrics.tasksByPriority.low },
    { name: 'Medium', value: metrics.tasksByPriority.medium },
    { name: 'High', value: metrics.tasksByPriority.high },
    { name: 'Critical', value: metrics.tasksByPriority.critical },
  ] : [];

  const statusData = metrics ? [
    { name: 'To Do', value: metrics.tasksByStatus.todo },
    { name: 'In Progress', value: metrics.tasksByStatus.inProgress },
    { name: 'In Review', value: metrics.tasksByStatus.inReview },
    { name: 'Done', value: metrics.tasksByStatus.done },
  ] : [];

  return (
    <Container size="xl" py="xl">
      <Group position="apart" mb="xl">
        <div>
          <h1 className="text-3xl font-bold">{project?.name} Analytics</h1>
          <Text color="dimmed">Project performance metrics and insights</Text>
        </div>
        <Select
          value={dateRange}
          onChange={(value) => setDateRange(value || '30')}
          data={[
            { value: '7', label: 'Last 7 days' },
            { value: '30', label: 'Last 30 days' },
            { value: '90', label: 'Last 90 days' },
            { value: '365', label: 'Last year' },
          ]}
        />
      </Group>

      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="overview" icon={<IconChartBar size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="velocity" icon={<IconChartLine size={16} />}>
            Velocity
          </Tabs.Tab>
          <Tabs.Tab value="burndown" icon={<IconChartLine size={16} />}>
            Burndown
          </Tabs.Tab>
          <Tabs.Tab value="team" icon={<IconUsers size={16} />}>
            Team
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="xl">
          <SimpleGrid cols={4} spacing="md" mb="xl">
            <Paper p="md" withBorder>
              <Group position="apart">
                <div>
                  <Text color="dimmed" size="xs" tt="uppercase" weight={700}>
                    Total Tasks
                  </Text>
                  <Text size="xl" weight={700}>
                    {metrics?.totalTasks || 0}
                  </Text>
                </div>
                <ThemeIcon color="blue" variant="light" size={38}>
                  <IconChartBar size={22} />
                </ThemeIcon>
              </Group>
            </Paper>

            <Paper p="md" withBorder>
              <Group position="apart">
                <div>
                  <Text color="dimmed" size="xs" tt="uppercase" weight={700}>
                    Completed
                  </Text>
                  <Text size="xl" weight={700} color="green">
                    {metrics?.completedTasks || 0}
                  </Text>
                  <Progress
                    value={metrics?.completionRate || 0}
                    size="xs"
                    mt="xs"
                    color="green"
                  />
                </div>
                <ThemeIcon color="green" variant="light" size={38}>
                  <IconCheck size={22} />
                </ThemeIcon>
              </Group>
            </Paper>

            <Paper p="md" withBorder>
              <Group position="apart">
                <div>
                  <Text color="dimmed" size="xs" tt="uppercase" weight={700}>
                    In Progress
                  </Text>
                  <Text size="xl" weight={700} color="blue">
                    {metrics?.inProgressTasks || 0}
                  </Text>
                </div>
                <ThemeIcon color="blue" variant="light" size={38}>
                  <IconProgress size={22} />
                </ThemeIcon>
              </Group>
            </Paper>

            <Paper p="md" withBorder>
              <Group position="apart">
                <div>
                  <Text color="dimmed" size="xs" tt="uppercase" weight={700}>
                    Overdue
                  </Text>
                  <Text size="xl" weight={700} color="red">
                    {metrics?.overdueTasks || 0}
                  </Text>
                </div>
                <ThemeIcon color="red" variant="light" size={38}>
                  <IconAlertTriangle size={22} />
                </ThemeIcon>
              </Group>
            </Paper>
          </SimpleGrid>

          <SimpleGrid cols={2} spacing="md">
            <Card>
              <Text size="lg" weight={600} mb="md">
                Tasks by Priority
              </Text>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <Text size="lg" weight={600} mb="md">
                Tasks by Status
              </Text>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </SimpleGrid>

          <Card mt="md">
            <Group position="apart" mb="md">
              <Text size="lg" weight={600}>
                Key Metrics
              </Text>
              <Button
                size="xs"
                variant="subtle"
                leftIcon={<IconDownload size={16} />}
                onClick={() => handleExport([metrics!], `${project?.name}-metrics`)}
              >
                Export
              </Button>
            </Group>
            <SimpleGrid cols={3} spacing="md">
              <Box>
                <Text size="sm" color="dimmed">
                  Completion Rate
                </Text>
                <RingProgress
                  sections={[{ value: metrics?.completionRate || 0, color: 'green' }]}
                  label={
                    <Text align="center" size="lg" weight={700}>
                      {(metrics?.completionRate || 0).toFixed(1)}%
                    </Text>
                  }
                />
              </Box>
              <Box>
                <Text size="sm" color="dimmed">
                  Average Task Duration
                </Text>
                <Text size="xl" weight={700} mt="xs">
                  {(metrics?.avgTaskDuration || 0).toFixed(1)} days
                </Text>
              </Box>
              <Box>
                <Text size="sm" color="dimmed">
                  Tasks per Status
                </Text>
                <Stack spacing="xs" mt="xs">
                  <Group position="apart">
                    <Text size="sm">To Do</Text>
                    <Badge>{metrics?.tasksByStatus.todo || 0}</Badge>
                  </Group>
                  <Group position="apart">
                    <Text size="sm">In Progress</Text>
                    <Badge color="blue">{metrics?.tasksByStatus.inProgress || 0}</Badge>
                  </Group>
                  <Group position="apart">
                    <Text size="sm">Done</Text>
                    <Badge color="green">{metrics?.tasksByStatus.done || 0}</Badge>
                  </Group>
                </Stack>
              </Box>
            </SimpleGrid>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="velocity" pt="xl">
          <Card>
            <Group position="apart" mb="md">
              <Text size="lg" weight={600}>
                Task Velocity
              </Text>
              <Button
                size="xs"
                variant="subtle"
                leftIcon={<IconDownload size={16} />}
                onClick={() => handleExport(velocity || [], `${project?.name}-velocity`)}
              >
                Export
              </Button>
            </Group>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={velocity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="created" stroke="#3b82f6" fill="#3b82f6" />
                <Area type="monotone" dataKey="completed" stroke="#10b981" fill="#10b981" />
                <Area type="monotone" dataKey="inProgress" stroke="#f59e0b" fill="#f59e0b" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="burndown" pt="xl">
          <Card>
            <Group position="apart" mb="md">
              <Text size="lg" weight={600}>
                Burndown Chart
              </Text>
              <Button
                size="xs"
                variant="subtle"
                leftIcon={<IconDownload size={16} />}
                onClick={() => handleExport(burndown || [], `${project?.name}-burndown`)}
              >
                Export
              </Button>
            </Group>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={burndown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="team" pt="xl">
          <Card>
            <Group position="apart" mb="md">
              <Text size="lg" weight={600}>
                Team Productivity
              </Text>
              <Button
                size="xs"
                variant="subtle"
                leftIcon={<IconDownload size={16} />}
                onClick={() => handleExport(productivity || [], `${project?.name}-productivity`)}
              >
                Export
              </Button>
            </Group>
            <Stack spacing="md">
              {productivity?.map((member) => (
                <Paper key={member.userId} p="md" withBorder>
                  <Group position="apart">
                    <div>
                      <Text weight={600}>{member.userName}</Text>
                      <Group spacing="xs" mt="xs">
                        <Badge color="green" variant="light">
                          {member.tasksCompleted} completed
                        </Badge>
                        <Badge color="blue" variant="light">
                          {member.tasksInProgress} in progress
                        </Badge>
                        {member.tasksOverdue > 0 && (
                          <Badge color="red" variant="light">
                            {member.tasksOverdue} overdue
                          </Badge>
                        )}
                      </Group>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Text size="xs" color="dimmed">
                        Productivity Score
                      </Text>
                      <Text size="xl" weight={700} color={member.productivity > 70 ? 'green' : 'orange'}>
                        {member.productivity.toFixed(0)}%
                      </Text>
                      <Text size="xs" color="dimmed">
                        Avg completion: {member.avgCompletionTime.toFixed(1)} days
                      </Text>
                    </div>
                  </Group>
                  <Progress
                    value={member.productivity}
                    color={member.productivity > 70 ? 'green' : member.productivity > 40 ? 'yellow' : 'red'}
                    size="sm"
                    mt="sm"
                  />
                </Paper>
              ))}
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}