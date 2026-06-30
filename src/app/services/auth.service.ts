import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoginRequest } from '../api/request/login-request';
import { AuthResponse } from '../api/response/auth-response';
import { Observable, tap, throwError } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private storageService = inject(StorageService);

  private _isLoggedIn = signal<boolean>(this.hasToken());
  isLoggedIn = this._isLoggedIn.asReadonly();

  login(user: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, user).pipe(
      tap((res: AuthResponse) => {
        if (res.token) {
          const refreshToken = res.refreshToken || (res as any).refresh_token;
          this.setTokens(res.token, refreshToken || res.token);
          this.storageService.setItem('username', res.username);
          this.storageService.setItem('nombreCompleto', res.nombreCompleto);
          this.storageService.setItem('roles', JSON.stringify(res.roles));
          this.storageService.setItem('modulos', JSON.stringify((res as any).modulos));
        }
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storageService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/refresh-token`, { refreshToken }).pipe(
      tap((response: AuthResponse) => {
        this.setTokens(response.token, response.refreshToken);
      })
    );
  }

  private hasToken(): boolean {
    return !!this.storageService.getToken();
  }

  public setTokens(token: string, refreshToken: string) {
    this.storageService.updateSession(token, refreshToken);
    this._isLoggedIn.set(true);
  }

  public setToken(token: string) {
    this.storageService.setItem('user_token', token);
    this._isLoggedIn.set(true);
  }

  getToken(): string | null {
    return this.storageService.getToken();
  }

  getUsername(): string {
    return this.storageService.getItem('username') || '';
  }

  getNombreCompleto(): string {
    return this.storageService.getItem('nombreCompleto') || '';
  }

  getRoles(): string[] {
    return JSON.parse(this.storageService.getItem('roles') || '[]');
  }

  getModulos(): any[] {
    return JSON.parse(this.storageService.getItem('modulos') || '[]');
  }

  hasRole(role: string): boolean {
    const roles = this.getRoles();
    if (!Array.isArray(roles)) return false;
    if (roles.includes('ADMIN GLOBAL') && role !== 'ROLE_PROVEEDOR') return true;
    return roles.includes(role);
  }

  logout() {
    this.storageService.removeItem('user_token');
    this.storageService.removeItem('refresh_token');
    this.storageService.removeItem('username');
    this.storageService.removeItem('nombreCompleto');
    this.storageService.removeItem('roles');
    this.storageService.removeItem('modulos');
    this.storageService.removeCookie('refresh_token');
    this._isLoggedIn.set(false);
    window.location.href = '/login';
  }
}