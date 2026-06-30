import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  credential = {
    identificador: '',
    password: ''
  };

  cargando = false;
  mostrarPassword = false;
  recordar = false;
  errorIdentificador = '';
  errorPassword = '';
  errorGeneral = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const guardado = localStorage.getItem('recordar_usuario');
    if (guardado) {
      this.credential.identificador = guardado;
      this.recordar = true;
    }
  }

  validar(): boolean {
    let valido = true;
    this.errorIdentificador = '';
    this.errorPassword = '';
    this.errorGeneral = '';

    const id = this.credential.identificador.trim();

    if (!id) {
      this.errorIdentificador = 'El usuario o correo es obligatorio.';
      valido = false;
    } else if (id.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)) {
      this.errorIdentificador = 'Ingresa un correo electrónico válido.';
      valido = false;
    }

    const pass = this.credential.password;

    if (!pass) {
      this.errorPassword = 'La contraseña es obligatoria.';
      valido = false;
    }

    return valido;
  }

  onLogin(): void {
    if (!this.validar()) return;

    if (this.recordar) {
      localStorage.setItem('recordar_usuario', this.credential.identificador);
    } else {
      localStorage.removeItem('recordar_usuario');
    }

    this.cargando = true;
    this.errorGeneral = '';

    this.authService.login(this.credential).subscribe({
      next: (response) => {
        console.log('¡Bienvenido al SUDAB!', response);
        this.cargando = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.cargando = false;
        this.errorGeneral = 'Credenciales incorrectas. Verifica tu usuario/correo y contraseña.';
      }
    });
  }
}