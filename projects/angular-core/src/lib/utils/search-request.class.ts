import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, switchMap, take } from 'rxjs/operators';
import { SearchRequestResponse } from '../interfaces/search-request-response.interface';
import { SearchRequest as ISearchRequest } from '../interfaces/search-request.interface';
import { FilterOperator } from '../interfaces/filter-operator.enum';

export class SearchRequestManager {
  page: number = 1;
  limit: number = 15;
  sortBy: string = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';
  search: string = '';
  filters: Record<string, { value: any; operator: FilterOperator }> = {};

  private reloadSubject = new BehaviorSubject<void>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  public isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  constructor(
    private getAllPaginatedItems: (
      searchRequest: ISearchRequest
    ) => Observable<SearchRequestResponse<any>>
  ) {}

  public loadData(): Observable<SearchRequestResponse<any>> {
    return this.reloadSubject.pipe(
      switchMap(() => {
        this.isLoadingSubject.next(true);
        return this.getAllPaginatedItems(this.toJSON()).pipe(
          take(1),
          finalize(() => this.isLoadingSubject.next(false))
        );
      })
    );
  }

  public reload(): void {
    this.reloadSubject.next();
  }

  public toJSON(): ISearchRequest {
    return {
      page: Math.max(1, this.page),
      limit: Math.max(1, this.limit),
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      search: this.search,
      filters: this.filters,
    };
  }
}
