import { Project, ProjectMember, ProjectRole, Prisma } from '@track-it/database';
import { 
  CreateProjectData, 
  UpdateProjectData, 
  ProjectWithStats,
  PaginatedResponse,
  SearchParams 
} from '@track-it/shared';
import { getDatabase } from './database';
import { AppError } from '../middleware/errorHandler';

export class ProjectService {
  private db = getDatabase();

  async create(data: CreateProjectData, userId: string): Promise<Project> {
    // Create project with creator as owner
    const project = await this.db.project.create({
      data: {
        ...data,
        members: {
          create: {
            userId,
            role: ProjectRole.OWNER,
          },
        },
      },
      include: {
        members: {
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
      },
    });

    return project;
  }

  async findAll(userId: string, params: SearchParams): Promise<PaginatedResponse<ProjectWithStats>> {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      members: {
        some: {
          userId,
        },
      },
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      this.db.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          members: {
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
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      }),
      this.db.project.count({ where }),
    ]);

    // Get task statistics for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const taskStats = await this.db.task.groupBy({
          by: ['status'],
          where: { projectId: project.id },
          _count: true,
        });

        const completedTaskCount = taskStats
          .filter((stat) => stat.status === 'DONE')
          .reduce((sum, stat) => sum + stat._count, 0);

        return {
          ...project,
          taskCount: project._count.tasks,
          completedTaskCount,
          memberCount: project.members.length,
        };
      })
    );

    return {
      items: projectsWithStats,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(projectId: string, userId: string): Promise<Project> {
    const project = await this.db.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
        categories: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    return project;
  }

  async update(projectId: string, data: UpdateProjectData, userId: string): Promise<Project> {
    // Check if user has permission to update
    await this.checkProjectPermission(projectId, userId, [ProjectRole.OWNER, ProjectRole.ADMIN]);

    const project = await this.db.project.update({
      where: { id: projectId },
      data,
      include: {
        members: {
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
      },
    });

    return project;
  }

  async delete(projectId: string, userId: string): Promise<void> {
    // Only owner can delete project
    await this.checkProjectPermission(projectId, userId, [ProjectRole.OWNER]);

    await this.db.project.update({
      where: { id: projectId },
      data: { isActive: false },
    });
  }

  async addMember(projectId: string, newUserId: string, role: ProjectRole, requesterId: string): Promise<ProjectMember> {
    // Check if requester has permission to add members
    await this.checkProjectPermission(projectId, requesterId, [ProjectRole.OWNER, ProjectRole.ADMIN]);

    // Check if user is already a member
    const existingMember = await this.db.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: newUserId,
          projectId,
        },
      },
    });

    if (existingMember) {
      throw new AppError(400, 'User is already a member of this project');
    }

    const member = await this.db.projectMember.create({
      data: {
        userId: newUserId,
        projectId,
        role,
      },
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
    });

    return member;
  }

  async updateMemberRole(projectId: string, memberId: string, role: ProjectRole, requesterId: string): Promise<ProjectMember> {
    // Only owner can change roles
    await this.checkProjectPermission(projectId, requesterId, [ProjectRole.OWNER]);

    const member = await this.db.projectMember.update({
      where: { id: memberId },
      data: { role },
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
    });

    return member;
  }

  async removeMember(projectId: string, memberId: string, requesterId: string): Promise<void> {
    // Check permission
    await this.checkProjectPermission(projectId, requesterId, [ProjectRole.OWNER, ProjectRole.ADMIN]);

    // Don't allow removing the last owner
    const owners = await this.db.projectMember.count({
      where: {
        projectId,
        role: ProjectRole.OWNER,
      },
    });

    const memberToRemove = await this.db.projectMember.findUnique({
      where: { id: memberId },
    });

    if (memberToRemove?.role === ProjectRole.OWNER && owners === 1) {
      throw new AppError(400, 'Cannot remove the last owner of a project');
    }

    await this.db.projectMember.delete({
      where: { id: memberId },
    });
  }

  async checkProjectPermission(projectId: string, userId: string, allowedRoles: ProjectRole[]): Promise<ProjectMember> {
    const member = await this.db.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!member) {
      throw new AppError(403, 'You are not a member of this project');
    }

    if (!allowedRoles.includes(member.role)) {
      throw new AppError(403, 'Insufficient permissions for this action');
    }

    return member;
  }

  async getUserRole(projectId: string, userId: string): Promise<ProjectRole | null> {
    const member = await this.db.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    return member?.role ?? null;
  }
}