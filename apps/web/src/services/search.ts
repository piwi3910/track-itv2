import { api } from './api';

export interface SearchFilters {
  status?: string[];
  priority?: string[];
  assigneeId?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
}

export interface GlobalSearchResult {
  projects: any[];
  tasks: any[];
  users: any[];
}

export interface FilterOptions {
  projects: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string; email: string }>;
  statuses: string[];
  priorities: string[];
}

class SearchService {
  async search(
    query: string,
    type: 'all' | 'projects' | 'tasks' | 'users' = 'all',
    filters?: SearchFilters,
    limit?: number,
    offset?: number
  ): Promise<SearchResult<any> | GlobalSearchResult> {
    const params = new URLSearchParams({
      q: query,
      type,
      ...(limit && { limit: limit.toString() }),
      ...(offset && { offset: offset.toString() }),
      ...(filters?.status && { status: filters.status.join(',') }),
      ...(filters?.priority && { priority: filters.priority.join(',') }),
      ...(filters?.assigneeId && { assigneeId: filters.assigneeId }),
      ...(filters?.projectId && { projectId: filters.projectId }),
      ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters?.dateTo && { dateTo: filters.dateTo }),
    });

    const response = await api.get(`/search?${params}`);
    return response.data;
  }

  async getFilterOptions(): Promise<FilterOptions> {
    const response = await api.get<FilterOptions>('/search/filters');
    return response.data;
  }
}

export const searchService = new SearchService();