import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Omitir endpoints públicos de tu Spring Boot
  if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register')) {
    return next(req);
  }

  let clonedRequest = req;

  if (token) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn('Sesión inválida o expirada en el servidor. Saliendo...');
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};