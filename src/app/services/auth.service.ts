import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { LoginRequest } from '../api/request/login-request';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../api/response/auth-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        console.log('Respuesta del login:', res);
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', res.username);
          localStorage.setItem('nombreCompleto', res.nombreCompleto);
          localStorage.setItem('roles', JSON.stringify(res.roles));
          localStorage.setItem('modulos', JSON.stringify(res.modulos));
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

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  getRoles(): string[] {
    return JSON.parse(localStorage.getItem('roles') || '[]');
  }

  getModulos(): { descripcion: string; url: string }[] {
    return JSON.parse(localStorage.getItem('modulos') || '[]');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.clear();
    window.location.href = '/login';
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }
  
}