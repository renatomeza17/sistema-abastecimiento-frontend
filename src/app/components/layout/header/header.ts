import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent implements OnInit {

  nombreCompleto = '';
  cargo = '';
  inicialNombre = '';
  isDarkMode = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.nombreCompleto = this.authService.getNombreCompleto() || 'Usuario';
    const roles = this.authService.getRoles();
    this.cargo = roles.length > 0 ? roles[0] : 'Usuario';

    if (this.nombreCompleto) {
      this.inicialNombre = this.nombreCompleto.charAt(0).toUpperCase();
    }

    // Opcional: Detectar si el usuario ya tenía preferencia de modo oscuro guardada
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    
    if (this.isDarkMode) {
      // Estándar moderno de Bootstrap 5 para cambiar todo el tema del sitio
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-bs-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }

  logout(): void {
    this.authService.logout();
  }
}