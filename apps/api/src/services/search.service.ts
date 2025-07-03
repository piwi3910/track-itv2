import { Prisma } from '@track-it/database';
import { getDatabase } from './database';
import { ProjectService } from './project.service';

export interface SearchFilters {
  status?: string[];
  priority?: string[];
  assigneeId?: string;
  projectId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  filters?: SearchFilters;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
}

export class SearchService {
  private db = getDatabase();
  private projectService = new ProjectService();

  async searchProjects(query: string, userId: string, options: SearchOptions = {}): Promise<SearchResult<any>> {
    const { limit = 20, offset = 0 } = options;

    // Get projects user has access to
    const userProjects = await this.projectService.getUserProjects(userId);
    const projectIds = userProjects.map(p => p.id);

    if (projectIds.length === 0) {
      return { items: [], total: 0, query };
    }

    // Build search conditions
    const searchConditions: Prisma.ProjectWhereInput = {
      id: { in: projectIds },
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Execute search
    const [items, total] = await Promise.all([
      this.db.project.findMany({
        where: searchConditions,
        include: {
          owner: {
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
              tasks: true,
              members: true,
            },
          },
        },
        orderBy: [
          { updatedAt: 'desc' },
          { name: 'asc' },
        ],
        take: limit,
        skip: offset,
      }),
      this.db.project.count({ where: searchConditions }),
    ]);

    return { items, total, query };
  }

  async searchTasks(query: string, userId: string, options: SearchOptions = {}): Promise<SearchResult<any>> {
    const { limit = 20, offset = 0, filters = {} } = options;

    // Get projects user has access to
    const userProjects = await this.projectService.getUserProjects(userId);
    const projectIds = userProjects.map(p => p.id);

    if (projectIds.length === 0) {
      return { items: [], total: 0, query };
    }

    // Build search conditions
    const searchConditions: Prisma.TaskWhereInput = {
      projectId: { in: projectIds },
      AND: [
        // Text search
        {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        // Status filter
        filters.status && filters.status.length > 0
          ? { status: { in: filters.status as any } }
          : {},
        // Priority filter
        filters.priority && filters.priority.length > 0
          ? { priority: { in: filters.priority as any } }
          : {},
        // Assignee filter
        filters.assigneeId
          ? { assigneeId: filters.assigneeId }
          : {},
        // Project filter
        filters.projectId
          ? { projectId: filters.projectId }
          : {},
        // Date range filter
        filters.dateFrom || filters.dateTo
          ? {
              createdAt: {
                gte: filters.dateFrom,
                lte: filters.dateTo,
              },
            }
          : {},
      ],
    };

    // Execute search
    const [items, total] = await Promise.all([
      this.db.task.findMany({
        where: searchConditions,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true,
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
              comments: true,
              attachments: true,
            },
          },
        },
        orderBy: [
          { updatedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      this.db.task.count({ where: searchConditions }),
    ]);

    return { items, total, query };
  }

  async searchUsers(query: string, userId: string, options: SearchOptions = {}): Promise<SearchResult<any>> {
    const { limit = 20, offset = 0 } = options;

    // Search users by name or email
    const searchConditions: Prisma.UserWhereInput = {
      OR: [
        { email: { contains: query, mode: 'insensitive' } },
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Execute search
    const [items, total] = await Promise.all([
      this.db.user.findMany({
        where: searchConditions,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          createdAt: true,
        },
        orderBy: [
          { firstName: 'asc' },
          { lastName: 'asc' },
        ],
        take: limit,
        skip: offset,
      }),
      this.db.user.count({ where: searchConditions }),
    ]);

    return { items, total, query };
  }

  async searchAll(query: string, userId: string): Promise<{
    projects: any[];
    tasks: any[];
    users: any[];
  }> {
    if (!query || query.trim().length < 2) {
      return { projects: [], tasks: [], users: [] };
    }

    const [projects, tasks, users] = await Promise.all([
      this.searchProjects(query, userId, { limit: 5 }),
      this.searchTasks(query, userId, { limit: 5 }),
      this.searchUsers(query, userId, { limit: 5 }),
    ]);

    return {
      projects: projects.items,
      tasks: tasks.items,
      users: users.items,
    };
  }

  // Get filter options based on user's accessible data
  async getFilterOptions(userId: string): Promise<{
    projects: Array<{ id: string; name: string }>;
    users: Array<{ id: string; name: string; email: string }>;
    statuses: string[];
    priorities: string[];
  }> {
    // Get user's projects
    const userProjects = await this.projectService.getUserProjects(userId);

    // Get unique assignees from user's projects
    const tasks = await this.db.task.findMany({
      where: {
        projectId: { in: userProjects.map(p => p.id) },
        assigneeId: { not: null },
      },
      select: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      distinct: ['assigneeId'],
    });

    const uniqueUsers = tasks
      .map(t => t.assignee)
      .filter(Boolean)
      .map(u => ({
        id: u!.id,
        name: `${u!.firstName} ${u!.lastName}`.trim(),
        email: u!.email,
      }));

    return {
      projects: userProjects.map(p => ({ id: p.id, name: p.name })),
      users: uniqueUsers,
      statuses: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
      priorities: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    };
  }
}