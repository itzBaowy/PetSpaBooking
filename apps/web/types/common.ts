export type Status = "idle" | "loading" | "success" | "error";

export interface Result<T> {
  status: Status;
  data?: T;
  error?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
