import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './services/auth-interceptor'; // Ajusta la ruta

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Activamos el cliente HTTP y le enchufamos el interceptor
    provideHttpClient(withInterceptors([authInterceptor])) 
  ]
};