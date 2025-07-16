import { HttpParams } from '@angular/common/http';

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

export interface RequestOptions {
  ignoreError?: boolean;
  withCredentials?: boolean;
  autoClose?: boolean; // For auto-unsubscribing
  params?: HttpParams;
  responseType?: 'json' | 'blob';
}
