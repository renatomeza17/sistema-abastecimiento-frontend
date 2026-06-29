import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoginRequest } from '../api/request/login-request';
import { Observable, tap } from 'rxjs';
import { AuthResponse, Modulo } from '../api/response/auth-response';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private storageService = inject(StorageService);

  currentUser = signal<string | null>(this.storageService.getItem('username'));
  currentUserRoles = signal<string[]>(JSON.parse(this.storageService.getItem('roles') || '[]'));
  currentUserModulos = signal<Modulo[]>(JSON.parse(this.storageService.getItem('modulos') || '[]'));

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          const refreshToken = res.refreshToken || res.refresh_token;
          localStorage.setItem('user_token', res.token);
          localStorage.setItem('refresh_token', refreshToken || res.token);
          localStorage.setItem('username', res.username);
          localStorage.setItem('nombreCompleto', res.nombreCompleto);
          localStorage.setItem('roles', JSON.stringify(res.roles));
          localStorage.setItem('modulos', JSON.stringify(res.modulos));
          if (refreshToken) {
            console.log('[AuthService] refresh_token recibido del backend');
          }
          this.storageService.updateSession(res.token, refreshToken || res.token);

          this.currentUser.set(res.username);
          this.currentUserRoles.set(res.roles);
          this.currentUserModulos.set(res.modulos);
        }
      })
    );
  }

  setTokens(token: string, refreshToken: string): void {
    this.storageService.updateSession(token, refreshToken);
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.storageService.getRefreshToken();
    console.log('[AuthService] Refrescando token. refresh:', !!refreshToken);
    return this.http.post<any>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap((res: any) => {
        if (res.token) {
          const newRefresh = res.refreshToken || res.refresh_token;
          this.setTokens(res.token, newRefresh);
          this.currentUser.set(res.username);
          this.currentUserRoles.set(res.roles);
          this.currentUserModulos.set(res.modulos);
        }
      })
    );
  }

  getToken(): string | null {
    return this.storageService.getToken();
  }

  getUsername(): string {
    return this.currentUser() || '';
  }

  getNombreCompleto(): string {
    return this.storageService.getItem('nombreCompleto') || '';
  }

  getRoles(): string[] {
    return this.currentUserRoles();
  }

  getModulos(): Modulo[] {
    return this.currentUserModulos();
  }

  hasRole(role: string): boolean {
  const roles = this.currentUserRoles();

  if (!Array.isArray(roles)) {
    return false;
  }

  if (roles.includes('ADMIN GLOBAL') && role !== 'ROLE_PROVEEDOR') {
    return true;
  }

  return roles.includes(role);
}

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.storageService.deleteSession();
    this.currentUser.set(null);
    this.currentUserRoles.set([]);
    this.currentUserModulos.set([]);
    window.location.href = '/login';
  }
}