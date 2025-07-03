import { Link } from 'react-router-dom';
import { ProjectWithStats } from '@track-it/shared';

interface ProjectCardProps {
  project: ProjectWithStats;
}

export function ProjectCard({ project }: ProjectCardProps): JSX.Element {
  const completionRate = project.taskCount > 0 
    ? Math.round((project.completedTaskCount / project.taskCount) * 100)
    : 0;

  return (
    <Link 
      to={`/projects/${project.id}`}
      className="block p-6 bg-card rounded-lg border hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{project.name}</h3>
            {project.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tasks</span>
          <span className="font-medium">{project.taskCount}</span>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Members</span>
          <span className="font-medium">{project.memberCount}</span>
        </div>
      </div>
    </Link>
  );
}