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
  
  constructor(private http: HttpClient) { }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', res.username);
          localStorage.setItem('roles', JSON.stringify(res.roles));
        }
      })
    );

  }

  

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  hasRole(role: string): boolean {
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    return roles.includes(role);
  }

}


