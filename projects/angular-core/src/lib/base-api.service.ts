import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Inject } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { API_URL } from './api-url.token';
import {
    HttpMethod,
    RequestOptions,
} from './interfaces/request-options.interface';
import { downloadFile } from './utils/download.utils';

export class BaseApiService {
  protected http = inject(HttpClient);

  // Event emitters for global error handling
  private static errorSubject = new Subject<string>();
  private static unauthorizedSubject = new Subject<void>();

  /** Emits a string message when an HTTP error (non-401) occurs. */
  public static error$ = BaseApiService.errorSubject.asObservable();

  /** Emits when a 401 Unauthorized response is received. */
  public static unauthorized$ =
    BaseApiService.unauthorizedSubject.asObservable();

  constructor(
    @Inject(API_URL) protected apiUrl: string,
    protected controllerPrefix: string = ''
  ) {}

  protected get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    return this.makeRequest<T>(HttpMethod.GET, endpoint, options);
  }

  protected delete<T>(
    endpoint: string,
    options?: RequestOptions
  ): Observable<T> {
    return this.makeRequest<T>(HttpMethod.DELETE, endpoint, options);
  }

  protected post<T>(
    endpoint: string,
    body: any,
    options?: RequestOptions
  ): Observable<T> {
    return this.makeRequest<T>(HttpMethod.POST, endpoint, options, body);
  }

  protected put<T>(
    endpoint: string,
    body: any,
    options?: RequestOptions
  ): Observable<T> {
    return this.makeRequest<T>(HttpMethod.PUT, endpoint, options, body);
  }

  protected patch<T>(
    endpoint: string,
    body: any,
    options?: RequestOptions
  ): Observable<T> {
    return this.makeRequest<T>(HttpMethod.PATCH, endpoint, options, body);
  }

  protected downloadFile(
    endpoint: string,
    body: any,
    filename: string,
    method: HttpMethod = HttpMethod.POST,
    mimeType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ): Observable<void> {
    const options: RequestOptions = {
      responseType: 'blob',
      ignoreError: false,
      autoClose: true,
    };

    return this.makeRequest<Blob>(method, endpoint, options, body).pipe(
      map((blob: Blob) => {
        downloadFile(blob, filename, mimeType);
      })
    );
  }

  private makeRequest<T>(
    method: HttpMethod,
    endpoint: string,
    options: RequestOptions = {},
    body?: any
  ): Observable<T> {
    const {
      ignoreError = false,
      withCredentials = true,
      autoClose = true,
      params,
      responseType = 'json',
    } = options;

    const httpOptions: any = {
      withCredentials,
      params,
      responseType,
    };

    const url = this.apiUrl + this.controllerPrefix + endpoint;

    let requestObservable: Observable<T>;

    switch (method) {
      case HttpMethod.GET:
        requestObservable = this.http.get<T>(url, httpOptions) as Observable<T>;
        break;
      case HttpMethod.DELETE:
        requestObservable = this.http.delete<T>(url, httpOptions) as Observable<T>;
        break;
      case HttpMethod.POST:
        requestObservable = this.http.post<T>(url, body, httpOptions) as Observable<T>;
        break;
      case HttpMethod.PATCH:
        requestObservable = this.http.patch<T>(url, body, httpOptions) as Observable<T>;
        break;
      case HttpMethod.PUT:
        requestObservable = this.http.put<T>(url, body, httpOptions) as Observable<T>;
        break;
      default:
        return throwError(() => new Error('Invalid HTTP method'));
    }

    return requestObservable.pipe(
      catchError((err) => this.handleError<T>(err, ignoreError)),
      autoClose ? take(1) : (obs) => obs
    );
  }

  private handleError<T>(
    response: HttpErrorResponse,
    ignoreError: boolean
  ): Observable<T> {
    const message = this.extractErrorMessage(response);

    if (response.status === 401) {
      BaseApiService.unauthorizedSubject.next();
    } else if (!ignoreError) {
      BaseApiService.errorSubject.next(message);
    }

    return throwError(() => new Error(message));
  }

  private extractErrorMessage(response: HttpErrorResponse): string {
    if (!response.error) {
      return `HTTP error! Status: ${response.status}`;
    }
    const errorMessage = response.error.message || response.error;
    if (Array.isArray(errorMessage)) {
      return errorMessage.join('\n');
    }
    return typeof errorMessage === 'string'
      ? errorMessage
      : 'An unknown error occurred';
  }
}
