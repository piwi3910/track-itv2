export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
}

export interface FilterParams {
  [key: string]: string | number | boolean | string[] | undefined;
}