import { Injectable, signal } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { LoginRequest } from '../api/request/login-request';
import { Observable, tap } from 'rxjs';
import { AuthResponse, Modulo } from '../api/response/auth-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;

  // Signals reactivas basadas en tus tipos reales de Spring Boot
  currentUser = signal<string | null>(localStorage.getItem('username'));
  currentUserRoles = signal<string[]>(JSON.parse(localStorage.getItem('roles') || '[]'));
  currentUserModulos = signal<Modulo[]>(JSON.parse(localStorage.getItem('modulos') || '[]'));

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', res.username);
          localStorage.setItem('nombreCompleto', res.nombreCompleto);
          localStorage.setItem('roles', JSON.stringify(res.roles));
          localStorage.setItem('modulos', JSON.stringify(res.modulos));

          // Sincronizar las señales
          this.currentUser.set(res.username);
          this.currentUserRoles.set(res.roles);
          this.currentUserModulos.set(res.modulos);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsername(): string {
    return this.currentUser() || '';
  }

  getNombreCompleto(): string {
    return localStorage.getItem('nombreCompleto') || '';
  }

  // SOLUCIÓN AL ERROR: Devolvemos getRoles() para el Header y Sidebar, pero leyendo la Signal
  getRoles(): string[] {
    return this.currentUserRoles();
  }

  getModulos(): Modulo[] {
    return this.currentUserModulos();
  }

  hasRole(role: string): boolean {
    return this.currentUserRoles().includes(role);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.clear();
    this.currentUser.set(null);
    this.currentUserRoles.set([]);
    this.currentUserModulos.set([]);
    window.location.href = '/login';
  }
}