export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface ProjectWithStats extends Project {
  taskCount: number;
  completedTaskCount: number;
  memberCount: number;
}