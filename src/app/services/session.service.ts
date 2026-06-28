import { Injectable } from '@angular/core';
import { UserSesion } from '../models/user-sesion';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  getInfoSession(): UserSesion | null {
    const token = localStorage.getItem('user_token');
    const username = localStorage.getItem('username');
    const nombreCompleto = localStorage.getItem('nombreCompleto');
    const roles = JSON.parse(localStorage.getItem('roles') || 'null');
    const modulos = JSON.parse(localStorage.getItem('modulos') || 'null');

    if (token && username && roles && modulos) {
      return { token, username, nombreCompleto: nombreCompleto || '', roles, modulos };
    }
    return null;
  }
}
