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

  // Signals reactivas basadas en tus tipos reales
  currentUser = signal<string | null>(localStorage.getItem('username'));
  currentUserRoles = signal<string[]>(JSON.parse(localStorage.getItem('roles') || '[]'));
  currentUserModulos = signal<Modulo[]>(JSON.parse(localStorage.getItem('modulos') || '[]'));

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        // Validación exacta basada en tu DTO del backend
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', res.username);
          localStorage.setItem('nombreCompleto', res.nombreCompleto);
          localStorage.setItem('roles', JSON.stringify(res.roles));
          localStorage.setItem('modulos', JSON.stringify(res.modulos));

          // Notificar cambios a la App en tiempo real
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

  getNombreCompleto(): string {
    return localStorage.getItem('nombreCompleto') || '';
  }

  // Validación de Roles ultra rápida gracias a Signals
  hasRole(role: string): boolean {
    return this.currentUserRoles().includes(role);
  }

  // Método reactivo para pintar el menú lateral dinámicamente usando tus módulos
  getModulos(): Modulo[] {
    return this.currentUserModulos();
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