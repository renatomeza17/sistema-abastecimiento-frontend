import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  credential = {
    identificador: '',
    password: ''
  };

  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    if (!this.credential.identificador.trim() || !this.credential.password.trim()) {
      alert('Ingresa tu usuario/correo y contraseña.');
      return;
    }

    this.cargando = true;

    this.authService.login(this.credential).subscribe({
      next: (response) => {
        console.log('¡Bienvenido al SUDAB!', response);
        this.cargando = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error en el login', error);
        this.cargando = false;
        alert('Credenciales incorrectas. Verifica tu usuario/correo y contraseña.');
      }
    });
  }
}