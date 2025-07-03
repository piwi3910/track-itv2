import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TextInput, Select, MultiSelect, DateInput, Button, Tabs, Badge, Group, Text, Paper, Loader } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { searchService, SearchFilters } from '../services/search';
import { TaskCard } from '../components/tasks/TaskCard';
import { ProjectCard } from '../components/projects/ProjectCard';
import { taskUtils } from '@track-it/shared';

export function SearchPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filters, setFilters] = useState<SearchFilters>({});
  
  // Fetch filter options
  const { data: filterOptions } = useQuery({
    queryKey: ['search-filters'],
    queryFn: () => searchService.getFilterOptions(),
  });

  // Perform search
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['search-results', query, activeTab, filters],
    queryFn: () => searchService.search(query, activeTab as any, filters),
    enabled: query.length >= 2,
  });

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  const handleSearch = (): void => {
    if (query.trim()) {
      setSearchParams({ q: query });
      refetch();
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any): void => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const renderResults = (): JSX.Element => {
    if (!data) return <></>;

    if (activeTab === 'all') {
      const allData = data as any;
      const hasResults = 
        (allData.projects?.length > 0) ||
        (allData.tasks?.length > 0) ||
        (allData.users?.length > 0);

      if (!hasResults) {
        return (
          <Text color="dimmed" className="text-center py-8">
            No results found for "{query}"
          </Text>
        );
      }

      return (
        <div className="space-y-8">
          {allData.projects?.length > 0 && (
            <div>
              <Text size="lg" weight={600} mb="md">
                Projects ({allData.projects.length})
              </Text>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allData.projects.map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}

          {allData.tasks?.length > 0 && (
            <div>
              <Text size="lg" weight={600} mb="md">
                Tasks ({allData.tasks.length})
              </Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allData.tasks.map((task: any) => (
                  <TaskCard key={task.id} task={task} onClick={() => navigate(`/tasks?id=${task.id}`)} />
                ))}
              </div>
            </div>
          )}

          {allData.users?.length > 0 && (
            <div>
              <Text size="lg" weight={600} mb="md">
                Users ({allData.users.length})
              </Text>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allData.users.map((user: any) => (
                  <Paper key={user.id} p="md" withBorder>
                    <Text weight={500}>
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text size="sm" color="dimmed">
                      {user.email}
                    </Text>
                  </Paper>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Specific type results
    const typedData = data as any;
    if (typedData.items?.length === 0) {
      return (
        <Text color="dimmed" className="text-center py-8">
          No {activeTab} found for "{query}"
        </Text>
      );
    }

    return (
      <div>
        <Text size="sm" color="dimmed" mb="md">
          Found {typedData.total} {activeTab}
        </Text>
        
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {typedData.items.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {typedData.items.map((task: any) => (
              <TaskCard key={task.id} task={task} onClick={() => navigate(`/tasks?id=${task.id}`)} />
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {typedData.items.map((user: any) => (
              <Paper key={user.id} p="md" withBorder>
                <Text weight={500}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text size="sm" color="dimmed">
                  {user.email}
                </Text>
              </Paper>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Search</h2>

      <Paper p="md" withBorder mb="lg">
        <Group align="flex-end">
          <TextInput
            label="Search query"
            placeholder="Enter search terms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button leftIcon={<IconSearch size={18} />} onClick={handleSearch}>
            Search
          </Button>
        </Group>

        {activeTab === 'tasks' && filterOptions && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <MultiSelect
              label="Status"
              placeholder="Select status"
              data={filterOptions.statuses.map(s => ({ value: s, label: taskUtils.getStatusLabel(s) }))}
              value={filters.status || []}
              onChange={(value) => handleFilterChange('status', value)}
            />
            <MultiSelect
              label="Priority"
              placeholder="Select priority"
              data={filterOptions.priorities.map(p => ({ value: p, label: taskUtils.getPriorityLabel(p) }))}
              value={filters.priority || []}
              onChange={(value) => handleFilterChange('priority', value)}
            />
            <Select
              label="Assignee"
              placeholder="Select assignee"
              data={filterOptions.users.map(u => ({ value: u.id, label: u.name }))}
              value={filters.assigneeId || ''}
              onChange={(value) => handleFilterChange('assigneeId', value)}
              clearable
            />
            <Select
              label="Project"
              placeholder="Select project"
              data={filterOptions.projects.map(p => ({ value: p.id, label: p.name }))}
              value={filters.projectId || ''}
              onChange={(value) => handleFilterChange('projectId', value)}
              clearable
            />
          </div>
        )}
      </Paper>

      {query.length >= 2 && (
        <Tabs value={activeTab} onTabChange={(value) => setActiveTab(value || 'all')}>
          <Tabs.List>
            <Tabs.Tab value="all">All Results</Tabs.Tab>
            <Tabs.Tab value="projects">Projects</Tabs.Tab>
            <Tabs.Tab value="tasks">Tasks</Tabs.Tab>
            <Tabs.Tab value="users">Users</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value={activeTab} pt="lg">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader />
              </div>
            ) : (
              renderResults()
            )}
          </Tabs.Panel>
        </Tabs>
      )}
    </div>
  );
}