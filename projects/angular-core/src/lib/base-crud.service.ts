import { HttpParams } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api-url.token';
import { BaseApiService } from './base-api.service';
import { SearchRequestResponse } from './interfaces/search-request-response.interface';
import { SearchRequest } from './interfaces/search-request.interface';

export class BaseCrudService<T, CreateDTO, UpdateDTO> extends BaseApiService {
  constructor(@Inject(API_URL) apiUrl: string, controllerPrefix: string) {
    super(apiUrl, controllerPrefix);
  }

  findAll(params?: Record<string, any>): Observable<T[]> {
    const httpParams = new HttpParams({ fromObject: params || {} });
    return this.get<T[]>('', { params: httpParams });
  }

  findById(id: string | number): Observable<T> {
    return this.get<T>(`/${id}`);
  }

  create(createDto: CreateDTO): Observable<T> {
    return this.post<T>('', createDto);
  }

  updateById(id: string | number, updateDto: UpdateDTO): Observable<T> {
    return this.patch<T>(`/${id}`, updateDto);
  }

  deleteById(id: string | number): Observable<{ message: string }> {
    return this.delete<{ message: string }>(`/${id}`);
  }

  deleteMany(ids: (string | number)[]): Observable<{ message: string }> {
    return this.post<{ message: string }>(`/delete-many`, { ids });
  }

  findByPagination(body: SearchRequest): Observable<SearchRequestResponse<T>> {
    return this.post<SearchRequestResponse<T>>('/paginated', body);
  }
}
