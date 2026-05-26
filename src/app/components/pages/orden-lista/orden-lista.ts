import { Component, OnInit } from '@angular/core';
import { OrdenResponseDTO } from '../../../api/response/ordenResponseDTO';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrdencompraService } from '../../../services/ordencompra.service';

@Component({
  selector: 'app-orden-lista',
  imports: [CommonModule],
  templateUrl: './orden-lista.html',
  styleUrl: './orden-lista.scss',
})
export class OrdenLista implements OnInit {

  ordenes: OrdenResponseDTO[] = [];
  
  // 💡 TIP: Cambia este valor a 'DIRECTOR_ADMINISTRATIVO', 'JEFE_ABASTECIMIENTO' o 'ALMACENERO'
  // en tus pruebas para ver cómo mutan los botones de la tabla según las acciones de tu backend.
  rolUsuarioLogueado: string = 'JEFE_ABASTECIMIENTO'; 

  constructor(
    private ordenService: OrdencompraService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    this.ordenService.listarTodas().subscribe({
      next: (data) => this.ordenes = data,
      error: (err) => console.error('Error al recuperar datos de la API', err)
    });
  }

  aprobar(id: number): void {
    this.ordenService.aprobarOrden(id).subscribe({
      next: (mensaje) => {
        alert(mensaje);
        this.cargarOrdenes(); // Refresca la tabla automáticamente
      }
    });
  }

  enviar(id: number): void {
    this.ordenService.enviarOrden(id).subscribe({
      next: () => {
        alert('Orden despachada al portal del proveedor correctamente.');
        this.cargarOrdenes();
      }
    });
  }

  archivar(id: number): void {
    this.ordenService.archivarOrden(id).subscribe({
      next: (mensaje) => {
        alert(mensaje);
        this.cargarOrdenes();
      }
    });
  }

  verDetalle(id: number): void {
    // Te redirige a la ruta del segundo componente pasando el ID por la URL
    this.router.navigate(['/ordenes/detalle', id]);
  }
}
