import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth'; // Ajusta la ruta a tu auth.ts

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Inyectamos el servicio para coger el token
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si tenemos token, clonamos la petición y le pegamos la cabecera Authorization
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  // Si no hay token (por ejemplo en el login), dejamos que la petición pase normal
  return next(req);
};