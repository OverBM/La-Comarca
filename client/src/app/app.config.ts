import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideSignalFormsConfig({
      classes: {
        'is-invalid': (field) => field.state().invalid() && field.state().touched(),
        'is-valid': (field) => field.state().valid() && field.state().touched(),
      },
    }),
  ],
};