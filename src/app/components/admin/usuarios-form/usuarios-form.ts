import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../services/usuario.service';
import { Rol } from '../../../models/usuario'; // Importación corregida

@Component({
  selector: 'app-usuarios-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-form.html',
  styleUrl: './usuarios-form.scss'
})
export class UsuariosForm implements OnInit {
  
  roles: Rol[] = [];

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.usuarioService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (err) => {
        console.error('Error al conectar con la base de datos:', err);
      }
    });
  }

  editarRol(rol: Rol): void {
    console.log('Editando rol:', rol.nombre);
    // Aquí podrías abrir un modal para editar
  }

  eliminarRol(id?: number): void {
    if (id && confirm('¿Estás seguro de eliminar este rol?')) {
      console.log('Eliminando rol con ID:', id);
      // Aquí llamarías a this.usuarioService.deleteRol(id)...
    }
  }
}