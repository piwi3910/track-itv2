export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface UserWithProjects extends User {
  projects: Array<{
    id: string;
    name: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  }>;
}