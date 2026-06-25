export interface ApiResponse<T> {
  data: T;
  message: string;
  status?: number;
  statusCode?: number;
}

export interface ApiError {
  message: string;
  status?: number;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
