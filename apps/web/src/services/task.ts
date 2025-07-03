import {
  Task,
  CreateTaskData,
  UpdateTaskData,
  PaginatedResponse,
  SearchParams,
} from '@track-it/shared';
import { api } from './api';

export const taskService = {
  async list(params?: SearchParams & { projectId?: string }): Promise<PaginatedResponse<Task>> {
    const { data } = await api.get<PaginatedResponse<Task>>('/tasks', { params });
    return data;
  },

  async get(taskId: string): Promise<Task> {
    const { data } = await api.get<Task>(`/tasks/${taskId}`);
    return data;
  },

  async create(taskData: CreateTaskData): Promise<Task> {
    const { data } = await api.post<Task>('/tasks', taskData);
    return data;
  },

  async update(taskId: string, taskData: UpdateTaskData): Promise<Task> {
    const { data } = await api.put<Task>(`/tasks/${taskId}`, taskData);
    return data;
  },

  async delete(taskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}`);
  },

  async updatePosition(taskId: string, position: number): Promise<Task> {
    const { data } = await api.put<Task>(`/tasks/${taskId}/position`, { position });
    return data;
  },
};