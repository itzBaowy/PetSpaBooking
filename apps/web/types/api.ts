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
  pageSize: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItem: number;
  totalPage: number;
}

export interface Paginated<T> extends PaginationMeta {
  items: T[];
}

/** @deprecated Use Paginated<T>. */
export type PaginatedResponse<T> = Paginated<T>;
