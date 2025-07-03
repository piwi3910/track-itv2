import { Task, TaskStatus } from '@track-it/database';
import { getDatabase } from './database';
import { ProjectService } from './project.service';
import { startOfDay, endOfDay, eachDayOfInterval, subDays } from 'date-fns';

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  completionRate: number;
  avgTaskDuration: number;
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  tasksByStatus: {
    todo: number;
    inProgress: number;
    inReview: number;
    done: number;
  };
}

export interface TaskVelocity {
  date: string;
  created: number;
  completed: number;
  inProgress: number;
}

export interface BurndownData {
  date: string;
  ideal: number;
  actual: number;
  remaining: number;
}

export interface TeamProductivity {
  userId: string;
  userName: string;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksOverdue: number;
  avgCompletionTime: number;
  productivity: number;
}

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export class AnalyticsService {
  private db = getDatabase();
  private projectService = new ProjectService();

  async getProjectMetrics(projectId: string, userId: string): Promise<ProjectMetrics> {
    // Verify user has access
    await this.projectService.checkProjectPermission(projectId, userId, ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);

    const tasks = await this.db.task.findMany({
      where: { projectId },
      select: {
        id: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        completedAt: true,
      },
    });

    const now = new Date();
    const metrics: ProjectMetrics = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'DONE').length,
      inProgressTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      todoTasks: tasks.filter(t => t.status === 'TODO').length,
      overdueTasks: tasks.filter(t => 
        t.status !== 'DONE' && 
        t.dueDate && 
        new Date(t.dueDate) < now
      ).length,
      completionRate: 0,
      avgTaskDuration: 0,
      tasksByPriority: {
        low: tasks.filter(t => t.priority === 'LOW').length,
        medium: tasks.filter(t => t.priority === 'MEDIUM').length,
        high: tasks.filter(t => t.priority === 'HIGH').length,
        critical: tasks.filter(t => t.priority === 'CRITICAL').length,
      },
      tasksByStatus: {
        todo: tasks.filter(t => t.status === 'TODO').length,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        inReview: tasks.filter(t => t.status === 'IN_REVIEW').length,
        done: tasks.filter(t => t.status === 'DONE').length,
      },
    };

    // Calculate completion rate
    if (metrics.totalTasks > 0) {
      metrics.completionRate = (metrics.completedTasks / metrics.totalTasks) * 100;
    }

    // Calculate average task duration
    const completedTasksWithDuration = tasks.filter(t => 
      t.status === 'DONE' && t.completedAt
    );
    if (completedTasksWithDuration.length > 0) {
      const totalDuration = completedTasksWithDuration.reduce((sum, task) => {
        const duration = new Date(task.completedAt!).getTime() - new Date(task.createdAt).getTime();
        return sum + duration;
      }, 0);
      metrics.avgTaskDuration = totalDuration / completedTasksWithDuration.length / (1000 * 60 * 60 * 24); // Convert to days
    }

    return metrics;
  }

  async getTaskVelocity(projectId: string, userId: string, range: TimeRange): Promise<TaskVelocity[]> {
    // Verify user has access
    await this.projectService.checkProjectPermission(projectId, userId, ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);

    const tasks = await this.db.task.findMany({
      where: {
        projectId,
        OR: [
          {
            createdAt: {
              gte: range.startDate,
              lte: range.endDate,
            },
          },
          {
            completedAt: {
              gte: range.startDate,
              lte: range.endDate,
            },
          },
        ],
      },
      select: {
        createdAt: true,
        completedAt: true,
        status: true,
      },
    });

    // Get all days in range
    const days = eachDayOfInterval({
      start: range.startDate,
      end: range.endDate,
    });

    // Calculate velocity for each day
    const velocity: TaskVelocity[] = days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);

      const created = tasks.filter(t => {
        const createdDate = new Date(t.createdAt);
        return createdDate >= dayStart && createdDate <= dayEnd;
      }).length;

      const completed = tasks.filter(t => {
        if (!t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return completedDate >= dayStart && completedDate <= dayEnd;
      }).length;

      const inProgress = tasks.filter(t => {
        const createdDate = new Date(t.createdAt);
        return createdDate <= dayEnd && t.status === 'IN_PROGRESS';
      }).length;

      return {
        date: day.toISOString().split('T')[0],
        created,
        completed,
        inProgress,
      };
    });

    return velocity;
  }

  async getBurndownChart(projectId: string, userId: string, range: TimeRange): Promise<BurndownData[]> {
    // Verify user has access
    await this.projectService.checkProjectPermission(projectId, userId, ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);

    const tasks = await this.db.task.findMany({
      where: {
        projectId,
        createdAt: {
          lte: range.endDate,
        },
      },
      select: {
        createdAt: true,
        completedAt: true,
        status: true,
      },
    });

    const totalTasks = tasks.filter(t => 
      new Date(t.createdAt) <= range.startDate
    ).length;

    const days = eachDayOfInterval({
      start: range.startDate,
      end: range.endDate,
    });

    const workingDays = days.length;
    const idealBurnRate = totalTasks / workingDays;

    const burndown: BurndownData[] = days.map((day, index) => {
      const dayEnd = endOfDay(day);
      
      // Count remaining tasks at end of day
      const completedByDay = tasks.filter(t => 
        t.completedAt && new Date(t.completedAt) <= dayEnd
      ).length;

      const createdByDay = tasks.filter(t => 
        new Date(t.createdAt) <= dayEnd
      ).length;

      const remaining = createdByDay - completedByDay;
      const ideal = totalTasks - (idealBurnRate * (index + 1));

      return {
        date: day.toISOString().split('T')[0],
        ideal: Math.max(0, ideal),
        actual: remaining,
        remaining,
      };
    });

    return burndown;
  }

  async getTeamProductivity(projectId: string, userId: string, range: TimeRange): Promise<TeamProductivity[]> {
    // Verify user has access
    await this.projectService.checkProjectPermission(projectId, userId, ['OWNER', 'ADMIN']);

    const tasks = await this.db.task.findMany({
      where: {
        projectId,
        assigneeId: { not: null },
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Group tasks by assignee
    const tasksByUser = new Map<string, typeof tasks>();
    
    tasks.forEach(task => {
      if (!task.assigneeId) return;
      
      if (!tasksByUser.has(task.assigneeId)) {
        tasksByUser.set(task.assigneeId, []);
      }
      tasksByUser.get(task.assigneeId)!.push(task);
    });

    const productivity: TeamProductivity[] = [];
    const now = new Date();

    tasksByUser.forEach((userTasks, userId) => {
      const user = userTasks[0].assignee!;
      const completedTasks = userTasks.filter(t => t.status === 'DONE');
      const inProgressTasks = userTasks.filter(t => t.status === 'IN_PROGRESS');
      const overdueTasks = userTasks.filter(t => 
        t.status !== 'DONE' && 
        t.dueDate && 
        new Date(t.dueDate) < now
      );

      // Calculate average completion time
      let avgCompletionTime = 0;
      if (completedTasks.length > 0) {
        const totalTime = completedTasks.reduce((sum, task) => {
          if (!task.completedAt) return sum;
          const duration = new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime();
          return sum + duration;
        }, 0);
        avgCompletionTime = totalTime / completedTasks.length / (1000 * 60 * 60 * 24); // Convert to days
      }

      // Calculate productivity score (completed / total * 100 - overdue penalty)
      const productivityScore = userTasks.length > 0
        ? (completedTasks.length / userTasks.length * 100) - (overdueTasks.length * 5)
        : 0;

      productivity.push({
        userId,
        userName: `${user.firstName} ${user.lastName}`,
        tasksCompleted: completedTasks.length,
        tasksInProgress: inProgressTasks.length,
        tasksOverdue: overdueTasks.length,
        avgCompletionTime,
        productivity: Math.max(0, productivityScore),
      });
    });

    return productivity.sort((a, b) => b.productivity - a.productivity);
  }

  async getProjectTimeline(projectId: string, userId: string, days: number = 30): Promise<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  }> {
    // Verify user has access
    await this.projectService.checkProjectPermission(projectId, userId, ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);

    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const velocity = await this.getTaskVelocity(projectId, userId, { startDate, endDate });

    return {
      labels: velocity.map(v => v.date),
      datasets: [
        {
          label: 'Created',
          data: velocity.map(v => v.created),
        },
        {
          label: 'Completed',
          data: velocity.map(v => v.completed),
        },
        {
          label: 'In Progress',
          data: velocity.map(v => v.inProgress),
        },
      ],
    };
  }
}