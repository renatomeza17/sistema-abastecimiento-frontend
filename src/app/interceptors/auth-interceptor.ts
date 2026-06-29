import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take, finalize } from 'rxjs/operators';

import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> =
  new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('[AUTH INTERCEPTOR] URL:', req.url);

  const storageService = inject(StorageService);
  const authService = inject(AuthService);

  const excludedPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh-token'
  ];

  const shouldExclude = excludedPaths.some(path => req.url.includes(path));

  if (shouldExclude) {
    console.log('[AUTH INTERCEPTOR] Ruta excluida:', req.url);
    return next(req);
  }

  const token = storageService.getToken();

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      console.log('[AUTH INTERCEPTOR] Error capturado:', error.status, req.url);

      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
        console.log('[AUTH INTERCEPTOR] Token expirado. Intentando refresh...');
        return refreshTokenAndRetry(req, next, authService);
      }

      return throwError(() => error);
    })
  );
};

function refreshTokenAndRetry(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<any> {

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        const newToken = response.token;

        console.log('[AUTH INTERCEPTOR] Nuevo token recibido');

        refreshTokenSubject.next(newToken);

        const retryRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`
          }
        });

        return next(retryRequest);
      }),
      catchError((err) => {
        console.error('[AUTH INTERCEPTOR] Error al refrescar token:', err);

        authService.logout();

        return throwError(() => err);
      }),
      finalize(() => {
        isRefreshing = false;
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap((token) => {
      const retryRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next(retryRequest);
    })
  );
}