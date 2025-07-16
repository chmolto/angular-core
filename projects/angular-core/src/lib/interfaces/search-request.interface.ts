import { FilterOperator } from './filter-operator.enum';

export interface SearchRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, { value: any; operator: FilterOperator }>;
}
