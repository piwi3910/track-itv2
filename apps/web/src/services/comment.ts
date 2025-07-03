import { api } from './api';
import { Comment, PaginatedResponse } from '@track-it/shared';

export interface CreateCommentDto {
  content: string;
  taskId: string;
}

export interface UpdateCommentDto {
  content: string;
}

class CommentService {
  async create(data: CreateCommentDto): Promise<Comment> {
    const response = await api.post<Comment>('/comments', data);
    return response.data;
  }

  async listByTask(taskId: string): Promise<Comment[]> {
    const response = await api.get<Comment[]>(`/comments/task/${taskId}`);
    return response.data;
  }

  async update(id: string, data: UpdateCommentDto): Promise<Comment> {
    const response = await api.put<Comment>(`/comments/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/comments/${id}`);
  }
}

export const commentService = new CommentService();