import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario, Rol } from '../models/usuario'; // Asegúrate de exportar 'Rol' en tu modelo
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private rolesUrl = `${environment.apiUrl}/roles`; // Nueva URL para roles

  constructor(private http: HttpClient) {}

  // --- MÉTODOS DE USUARIOS ---

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  createUsuario(usuario: any): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  updateUsuario(id: number, usuario: any): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- MÉTODOS DE ROLES (Para tus tarjetas y selectores) ---

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.rolesUrl);
  }

  // Si necesitas crear un rol desde la pantalla de tarjetas
  createRol(rol: Rol): Observable<Rol> {
    return this.http.post<Rol>(this.rolesUrl, rol);
  }
}