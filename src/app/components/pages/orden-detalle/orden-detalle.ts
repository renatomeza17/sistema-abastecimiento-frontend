import { Component, OnInit } from '@angular/core';
import { OrdenResponseDTO } from '../../../api/response/ordenResponseDTO';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrdencompraService } from '../../../services/ordencompra.service';

@Component({
  selector: 'app-orden-detalle',
  imports: [CommonModule, RouterModule],
  templateUrl: './orden-detalle.html',
  styleUrl: './orden-detalle.scss',
})
export class OrdenDetalle implements OnInit {

  orden?: OrdenResponseDTO;
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordenService: OrdencompraService
  ) { }

  ngOnInit(): void {
    // Captura el parámetro 'id' que configuramos en app.routes.ts (ordenes/detalle/:id)
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (id) {
      this.obtenerDetalleOrden(id);
    } else {
      this.cargando = false;
      console.error('No se proporcionó un ID de orden válido en la URL.');
    }
  }

  obtenerDetalleOrden(id: number): void {
    this.ordenService.consultarPorId(id).subscribe({
      next: (data) => {
        this.orden = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al recuperar el detalle desde Spring Boot:', err);
        this.cargando = false;
        alert('No se pudo cargar la información de la orden de compra.');
      }
    });
  }

  regresar(): void {
    this.router.navigate(['/compras/lista']);
  }

  imprimirDocumento(): void {
    window.print();
  }
}
