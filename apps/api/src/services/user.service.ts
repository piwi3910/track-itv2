import { User } from '@track-it/database';
import bcrypt from 'bcryptjs';
import { getDatabase } from './database';
import { AppError } from '../middleware/errorHandler';
import { deleteFile, getFileUrl } from '../config/upload';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  timezone?: string;
  theme?: 'light' | 'dark' | 'system';
  emailNotifications?: boolean;
  mentionNotifications?: boolean;
  taskNotifications?: boolean;
  projectNotifications?: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateAvatarData {
  filename: string;
  path: string;
}

export class UserService {
  private db = getDatabase();

  async findById(userId: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        timezone: true,
        theme: true,
        emailNotifications: true,
        mentionNotifications: true,
        taskNotifications: true,
        projectNotifications: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<User> {
    const user = await this.db.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        timezone: true,
        theme: true,
        emailNotifications: true,
        mentionNotifications: true,
        taskNotifications: true,
        projectNotifications: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, data: ChangePasswordData): Promise<void> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError(400, 'Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password
    await this.db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async updateAvatar(userId: string, data: UpdateAvatarData): Promise<User> {
    // Get current user to delete old avatar if exists
    const currentUser = await this.db.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // Update user with new avatar
    const user = await this.db.user.update({
      where: { id: userId },
      data: {
        avatar: getFileUrl(data.path),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        timezone: true,
        theme: true,
        emailNotifications: true,
        mentionNotifications: true,
        taskNotifications: true,
        projectNotifications: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Delete old avatar file if it was uploaded (not a default avatar)
    if (currentUser?.avatar && currentUser.avatar.includes('/uploads/')) {
      const oldPath = currentUser.avatar.split('/uploads/')[1];
      if (oldPath) {
        await deleteFile(`${process.env.UPLOAD_DIR || 'uploads'}/${oldPath}`);
      }
    }

    return user;
  }

  async deleteAvatar(userId: string): Promise<User> {
    const currentUser = await this.db.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // Update user to remove avatar
    const user = await this.db.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        timezone: true,
        theme: true,
        emailNotifications: true,
        mentionNotifications: true,
        taskNotifications: true,
        projectNotifications: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Delete avatar file if it was uploaded
    if (currentUser?.avatar && currentUser.avatar.includes('/uploads/')) {
      const oldPath = currentUser.avatar.split('/uploads/')[1];
      if (oldPath) {
        await deleteFile(`${process.env.UPLOAD_DIR || 'uploads'}/${oldPath}`);
      }
    }

    return user;
  }

  async getUserStats(userId: string): Promise<{
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
  }> {
    const [totalProjects, tasks] = await Promise.all([
      this.db.projectMember.count({
        where: { userId },
      }),
      this.db.task.findMany({
        where: {
          OR: [
            { assigneeId: userId },
            { creatorId: userId },
          ],
        },
        select: {
          status: true,
          dueDate: true,
        },
      }),
    ]);

    const now = new Date();
    const stats = {
      totalProjects,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'DONE').length,
      overdueTasks: tasks.filter(t => 
        t.status !== 'DONE' && 
        t.dueDate && 
        new Date(t.dueDate) < now
      ).length,
    };

    return stats;
  }
}