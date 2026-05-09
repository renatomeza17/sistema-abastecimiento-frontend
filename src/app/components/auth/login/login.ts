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
    username:'',
    password:''

  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  onLogin(){

    const cleanData: LoginRequest = {
    username: this.credential.username,
    password: this.credential.password,
    
  };

    this.authService.login(cleanData).subscribe({
      next: (response) => {
        console.log('¡Bienvenido al SUDAB!', response);
        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        console.error('Error en el login', error);
        alert('Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.');
      }
    });

  }




}
