import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { API_URL } from './api-url.token';

@NgModule({
  imports: [CommonModule],
})
export class AngularCoreModule {
  static forRoot(apiUrl: string): ModuleWithProviders<AngularCoreModule> {
    return {
      ngModule: AngularCoreModule,
      providers: [{ provide: API_URL, useValue: apiUrl }],
    };
  }
}
