export interface SearchRequestResponse<T> {
  data: T[];
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}
