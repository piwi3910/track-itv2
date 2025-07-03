import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectService } from '../services/project';
import { taskService } from '../services/task';
import { ProjectCard } from '../components/projects/ProjectCard';
import { TaskCard } from '../components/tasks/TaskCard';
import { isOverdue } from '@track-it/shared';

export function DashboardPage(): JSX.Element {
  const { data: projectsData } = useQuery({
    queryKey: ['projects-dashboard'],
    queryFn: () => projectService.list({ limit: 6 }),
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks-dashboard'],
    queryFn: () => taskService.list({ limit: 10, sortBy: 'updatedAt' }),
  });

  const tasks = tasksData?.items || [];
  const projects = projectsData?.items || [];

  // Calculate statistics
  const stats = {
    totalTasks: tasksData?.total || 0,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'DONE').length,
    overdue: tasks.filter(t => t.dueDate && t.status !== 'DONE' && isOverdue(t.dueDate)).length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Total Tasks</h3>
            <p className="text-2xl font-bold mt-2">{stats.totalTasks}</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">In Progress</h3>
            <p className="text-2xl font-bold mt-2">{stats.inProgress}</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
            <p className="text-2xl font-bold mt-2">{stats.completed}</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Overdue</h3>
            <p className="text-2xl font-bold mt-2 text-destructive">{stats.overdue}</p>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Recent Projects</h3>
          <Link to="/projects" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="bg-card rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">No projects yet.</p>
            <Link to="/projects" className="text-primary hover:underline text-sm">
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Tasks */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Recent Tasks</h3>
          <Link to="/tasks" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>
        {tasks.length === 0 ? (
          <div className="bg-card rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">No tasks yet.</p>
            <Link to="/tasks" className="text-primary hover:underline text-sm">
              Create your first task
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.slice(0, 6).map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}