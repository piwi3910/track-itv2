export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  completedAt?: Date;
  projectId: string;
  categoryId?: string;
  creatorId: string;
  assigneeId?: string;
  parentId?: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: Date;
  estimatedHours?: number;
  projectId: string;
  categoryId?: string;
  assigneeId?: string;
  parentId?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  categoryId?: string;
  assigneeId?: string;
  position?: number;
}