import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Si la ruta pide un rol específico, lo validamos
    const expectedRole = route.data['role'];
    if (expectedRole && !authService.hasRole(expectedRole)) {
      router.navigate(['/dashboard']); // Si no tiene permiso, lo mandamos al inicio
      return false;
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
};
