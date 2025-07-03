import { api } from './api';

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

export interface ProjectTimeline {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
  }>;
}

class AnalyticsService {
  async getProjectMetrics(projectId: string): Promise<ProjectMetrics> {
    const response = await api.get<ProjectMetrics>(`/analytics/projects/${projectId}/metrics`);
    return response.data;
  }

  async getTaskVelocity(
    projectId: string,
    options?: { startDate?: string; endDate?: string; days?: number }
  ): Promise<TaskVelocity[]> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.days) params.append('days', options.days.toString());

    const response = await api.get<TaskVelocity[]>(
      `/analytics/projects/${projectId}/velocity?${params}`
    );
    return response.data;
  }

  async getBurndownChart(
    projectId: string,
    options?: { startDate?: string; endDate?: string; days?: number }
  ): Promise<BurndownData[]> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.days) params.append('days', options.days.toString());

    const response = await api.get<BurndownData[]>(
      `/analytics/projects/${projectId}/burndown?${params}`
    );
    return response.data;
  }

  async getTeamProductivity(
    projectId: string,
    options?: { startDate?: string; endDate?: string; days?: number }
  ): Promise<TeamProductivity[]> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.days) params.append('days', options.days.toString());

    const response = await api.get<TeamProductivity[]>(
      `/analytics/projects/${projectId}/productivity?${params}`
    );
    return response.data;
  }

  async getProjectTimeline(projectId: string, days?: number): Promise<ProjectTimeline> {
    const params = days ? `?days=${days}` : '';
    const response = await api.get<ProjectTimeline>(
      `/analytics/projects/${projectId}/timeline${params}`
    );
    return response.data;
  }

  exportToCSV(data: any[], filename: string): void {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const analyticsService = new AnalyticsService();