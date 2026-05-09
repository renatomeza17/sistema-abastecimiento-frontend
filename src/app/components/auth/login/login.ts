import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { LoginRequest } from '../../../api/request/login-request';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})

export class Login {

  credential={
    // email:'',
    identificador:'',
    password:''

  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  onLogin() {
    
    // 2. Enviamos la petición
    this.authService.login(this.credential).subscribe({
      next: (response) => {
        console.log('¡Bienvenido al SUDAB!', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error en el login', error);
        alert('Credenciales incorrectas. Verifica tu usuario/correo y contraseña.');
      }
    });
  }




}
