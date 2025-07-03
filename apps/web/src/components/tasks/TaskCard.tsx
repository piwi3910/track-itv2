import { Task, Priority, TaskStatus } from '@track-it/shared';
import { formatDate, isOverdue, isDueSoon } from '@track-it/shared';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

const priorityColors: Record<Priority, string> = {
  LOW: 'bg-slate-500',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
};

const statusColors: Record<TaskStatus, string> = {
  TODO: 'bg-gray-500',
  IN_PROGRESS: 'bg-blue-500',
  IN_REVIEW: 'bg-purple-500',
  DONE: 'bg-green-500',
  CANCELLED: 'bg-gray-400',
};

export function TaskCard({ task, onClick }: TaskCardProps): JSX.Element {
  const isTaskOverdue = task.dueDate && task.status !== 'DONE' && isOverdue(task.dueDate);
  const isTaskDueSoon = task.dueDate && task.status !== 'DONE' && isDueSoon(task.dueDate);

  return (
    <div
      onClick={() => onClick(task)}
      className="p-4 bg-card rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-base line-clamp-2 flex-1">{task.title}</h4>
        <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]} ml-2`} />
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full text-white ${statusColors[task.status]}`}>
            {task.status.replace('_', ' ')}
          </span>
          
          {task.assignee && (
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {task.assignee.firstName[0]}{task.assignee.lastName[0]}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {task.dueDate && (
            <span className={isTaskOverdue ? 'text-destructive' : isTaskDueSoon ? 'text-orange-500' : ''}>
              {formatDate(task.dueDate)}
            </span>
          )}
          
          {task._count && (
            <>
              {task._count.comments > 0 && (
                <span className="flex items-center gap-1">
                  💬 {task._count.comments}
                </span>
              )}
              {task._count.attachments > 0 && (
                <span className="flex items-center gap-1">
                  📎 {task._count.attachments}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}