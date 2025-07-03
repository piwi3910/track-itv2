import { Task, TaskStatus, Priority, Prisma } from '@track-it/database';
import {
  CreateTaskData,
  UpdateTaskData,
  PaginatedResponse,
  SearchParams,
} from '@track-it/shared';
import { getDatabase } from './database';
import { AppError } from '../middleware/errorHandler';
import { ProjectService } from './project.service';
import { emitToProject, emitToTask } from './socket';
import { NotificationService } from './notification.service';

export class TaskService {
  private db = getDatabase();
  private projectService = new ProjectService();
  private notificationService = new NotificationService();

  async create(data: CreateTaskData, userId: string): Promise<Task> {
    // Verify user has access to the project
    await this.projectService.checkProjectPermission(data.projectId, userId, ['OWNER', 'ADMIN', 'MEMBER']);

    // If parentId is provided, verify it exists and belongs to the same project
    if (data.parentId) {
      const parentTask = await this.db.task.findFirst({
        where: {
          id: data.parentId,
          projectId: data.projectId,
        },
      });

      if (!parentTask) {
        throw new AppError(400, 'Parent task not found or belongs to different project');
      }
    }

    // Get the next position for the task
    const maxPosition = await this.db.task.findFirst({
      where: { projectId: data.projectId, parentId: data.parentId ?? null },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const task = await this.db.task.create({
      data: {
        ...data,
        creatorId: userId,
        position: (maxPosition?.position ?? -1) + 1,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
        _count: {
          select: {
            subtasks: true,
            comments: true,
            attachments: true,
          },
        },
      },
    });

    // Create activity log
    await this.createActivity(task.id, userId, 'TASK_CREATED', `Created task "${task.title}"`);

    // Send notification if task is assigned
    if (task.assigneeId && task.assigneeId !== userId) {
      await this.notificationService.notifyTaskAssignment(task.id, task.assigneeId, userId);
    }

    // Emit real-time update
    emitToProject(task.projectId, 'task:created', task);

    return task;
  }

  async findAll(userId: string, projectId: string | undefined, params: SearchParams): Promise<PaginatedResponse<Task>> {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.TaskWhereInput = {};

    // If projectId is provided, verify user has access
    if (projectId) {
      await this.projectService.checkProjectPermission(projectId, userId, ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);
      where.projectId = projectId;
    } else {
      // Get all projects user has access to
      const userProjects = await this.db.projectMember.findMany({
        where: { userId },
        select: { projectId: true },
      });
      where.projectId = { in: userProjects.map(p => p.projectId) };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tasks, total] = await Promise.all([
      this.db.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          category: true,
          creator: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          assignee: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              subtasks: true,
              comments: true,
              attachments: true,
            },
          },
        },
      }),
      this.db.task.count({ where }),
    ]);

    return {
      items: tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(taskId: string, userId: string): Promise<Task> {
    const task = await this.db.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        category: true,
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        subtasks: {
          include: {
            assignee: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        attachments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    // Verify user has access to the project
    await this.projectService.checkProjectPermission(task.projectId, userId, ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);

    return task;
  }

  async update(taskId: string, data: UpdateTaskData, userId: string): Promise<Task> {
    // Get existing task
    const existingTask = await this.db.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      throw new AppError(404, 'Task not found');
    }

    // Verify user has permission
    await this.projectService.checkProjectPermission(existingTask.projectId, userId, ['OWNER', 'ADMIN', 'MEMBER']);

    // Track changes for activity log
    const changes: string[] = [];
    if (data.status && data.status !== existingTask.status) {
      changes.push(`status from ${existingTask.status} to ${data.status}`);
      if (data.status === 'DONE') {
        data.completedAt = new Date();
      } else {
        data.completedAt = null;
      }
    }
    if (data.priority && data.priority !== existingTask.priority) {
      changes.push(`priority from ${existingTask.priority} to ${data.priority}`);
    }
    if (data.assigneeId !== undefined && data.assigneeId !== existingTask.assigneeId) {
      changes.push(data.assigneeId ? 'assigned to user' : 'unassigned');
    }

    const task = await this.db.task.update({
      where: { id: taskId },
      data,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    // Create activity logs
    if (changes.length > 0) {
      await this.createActivity(
        task.id,
        userId,
        'TASK_UPDATED',
        `Updated ${changes.join(', ')}`
      );
    }

    // Send notification for new assignment
    if (data.assigneeId !== undefined && data.assigneeId !== existingTask.assigneeId) {
      if (data.assigneeId && data.assigneeId !== userId) {
        await this.notificationService.notifyTaskAssignment(task.id, data.assigneeId, userId);
      }
    }

    // Emit real-time update
    emitToTask(task.id, 'task:updated', task);
    emitToProject(task.projectId, 'task:updated', task);

    return task;
  }

  async delete(taskId: string, userId: string): Promise<void> {
    const task = await this.db.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    // Verify user has permission
    await this.projectService.checkProjectPermission(task.projectId, userId, ['OWNER', 'ADMIN']);

    // Delete task and all related data (cascading deletes handle this)
    await this.db.task.delete({
      where: { id: taskId },
    });

    // Emit real-time update
    emitToProject(task.projectId, 'task:deleted', { id: taskId });
  }

  async updatePosition(taskId: string, newPosition: number, userId: string): Promise<Task> {
    const task = await this.db.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    // Verify user has permission
    await this.projectService.checkProjectPermission(task.projectId, userId, ['OWNER', 'ADMIN', 'MEMBER']);

    // Get all tasks in the same list (same project and parent)
    const tasks = await this.db.task.findMany({
      where: {
        projectId: task.projectId,
        parentId: task.parentId,
      },
      orderBy: { position: 'asc' },
    });

    // Reorder tasks
    const updatedTasks = tasks
      .filter(t => t.id !== taskId)
      .splice(newPosition, 0, task);

    // Update positions
    await Promise.all(
      updatedTasks.map((t, index) =>
        this.db.task.update({
          where: { id: t.id },
          data: { position: index },
        })
      )
    );

    return await this.findById(taskId, userId);
  }

  private async createActivity(
    taskId: string,
    userId: string,
    type: string,
    description: string,
    metadata?: any
  ): Promise<void> {
    await this.db.activity.create({
      data: {
        taskId,
        userId,
        type: type as any,
        description,
        metadata,
      },
    });
  }
}