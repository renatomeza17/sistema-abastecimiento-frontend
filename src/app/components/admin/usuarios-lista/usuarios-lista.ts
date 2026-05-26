import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario';

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-lista.html',
  styleUrl: './usuarios-lista.scss',
})
export class UsuariosLista implements OnInit {
  usuarios: Usuario[] = [];

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (data: Usuario[]) => {
        this.usuarios = data;
        console.log('Usuarios cargados:', this.usuarios); // Para verificar en la consola
      },
      error: (err: any) => {
        console.error('Error al cargar:', err);
      }
    });
  }

  getAvatar(u: Usuario): string {
    // IMPORTANTE: Usar las mayúsculas correctas según tu JSON
    const n = u.persona?.nombres?.charAt(0) || '';
    const ap = u.persona?.apellidoPaterno?.charAt(0) || ''; // Corregido: P mayúscula
    return (n + ap).toUpperCase() || '?';
  }
}