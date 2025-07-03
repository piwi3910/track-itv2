import { api } from './api';
import { User } from '@track-it/shared';

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

export interface UserStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

class UserService {
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/users/profile');
    return response.data;
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await api.put<User>('/users/profile', data);
    return response.data;
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    await api.put('/users/profile/password', data);
  }

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post<User>('/users/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteAvatar(): Promise<User> {
    const response = await api.delete<User>('/users/profile/avatar');
    return response.data;
  }

  async getStats(): Promise<UserStats> {
    const response = await api.get<UserStats>('/users/profile/stats');
    return response.data;
  }
}

export const userService = new UserService();