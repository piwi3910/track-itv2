import {
  Project,
  ProjectWithStats,
  CreateProjectData,
  UpdateProjectData,
  PaginatedResponse,
  SearchParams,
  ProjectMember,
} from '@track-it/shared';
import { api } from './api';

export const projectService = {
  async list(params?: SearchParams): Promise<PaginatedResponse<ProjectWithStats>> {
    const { data } = await api.get<PaginatedResponse<ProjectWithStats>>('/projects', { params });
    return data;
  },

  async get(projectId: string): Promise<Project> {
    const { data } = await api.get<Project>(`/projects/${projectId}`);
    return data;
  },

  async create(projectData: CreateProjectData): Promise<Project> {
    const { data } = await api.post<Project>('/projects', projectData);
    return data;
  },

  async update(projectId: string, projectData: UpdateProjectData): Promise<Project> {
    const { data } = await api.put<Project>(`/projects/${projectId}`, projectData);
    return data;
  },

  async delete(projectId: string): Promise<void> {
    await api.delete(`/projects/${projectId}`);
  },

  async addMember(projectId: string, userId: string, role: string): Promise<ProjectMember> {
    const { data } = await api.post<ProjectMember>(`/projects/${projectId}/members`, {
      userId,
      role,
    });
    return data;
  },

  async updateMemberRole(projectId: string, memberId: string, role: string): Promise<ProjectMember> {
    const { data } = await api.put<ProjectMember>(`/projects/${projectId}/members/${memberId}`, {
      role,
    });
    return data;
  },

  async removeMember(projectId: string, memberId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/members/${memberId}`);
  },
};