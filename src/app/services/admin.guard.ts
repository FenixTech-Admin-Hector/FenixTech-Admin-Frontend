import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth'; // Ajusta la ruta a tu auth.ts

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si está logueado Y además es administrador, le dejamos pasar
  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  // Si no, lo redirigimos al login de cabeza
  router.navigate(['/login']);
  return false;
};