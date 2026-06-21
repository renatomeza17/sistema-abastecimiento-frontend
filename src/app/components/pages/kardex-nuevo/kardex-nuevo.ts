import { Component, OnInit } from '@angular/core';
import { Producto } from '../../../models/Producto';
import { KardexRequestDTO } from '../../../api/request/kardexRequestDTO';
import { KardexService } from '../../../services/kardex.service';
import { CommonModule } from '@angular/common'; // <-- 1. IMPORTANTE: Trae *ngIf, *ngFor, etc.
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-kardex-nuevo',
  imports: [CommonModule,FormsModule, RouterModule],
  templateUrl: './kardex-nuevo.html',
  styleUrl: './kardex-nuevo.scss'
})


export class KardexNuevo implements OnInit {
 // Molde adaptado con las variables manuales elegibles desde los select del HTML
  kardexRequest: any = {
    idProducto: null,
    unidadMedida: '',
    categoria: '',
    subcategoria: '',
    stockMinimo: null,
    ubicacionAlmacen: '',
    caracteristicas: ''
  };

  productosDisponibles: any[] = [];
  productoSeleccionado: any | null = null;
  mensajeExito: string = '';
  mensajeError: string = '';

  constructor(
    private kardexService: KardexService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCatalogoMaestro();
  }

  cargarCatalogoMaestro(): void {
    this.kardexService.obtenerProductosDisponibles()
      .subscribe({
        next: (data: any[]) => {
          this.productosDisponibles = data;
        },
        error: (err: any) => {
          console.error('Fallo de comunicación asíncrona:', err);
          this.mensajeError = 'Error de conexión: No se pudieron cargar los productos del catálogo.';
        }
      });
  }

  // Intercepta el cambio de producto para capturar código y nombre en caliente
  onProductoChange(): void {
    if (this.kardexRequest.idProducto) {
      this.productoSeleccionado = this.productosDisponibles.find(
        (p: any) => p.idProducto == this.kardexRequest.idProducto
      );
    } else {
      this.productoSeleccionado = null;
    }
  }

  guardarFichaTecnica(): void {
    console.log('Enviando DTO unificado y parametrizado:', this.kardexRequest);

    const confirmacion = window.confirm('¿Está seguro de aperturar la ficha técnica de Kárdex para este producto?');

    // Si el usuario hace clic en "Cancelar", detenemos la ejecución aquí
    if (!confirmacion) {
      return; 
    }

    this.kardexService.crearNuevoAsiento(this.kardexRequest)
      .subscribe({
        next: (res: any) => {
          // 2. Si Angular logra leer la respuesta perfectamente, lanza esta alerta:
          alert('✅ ¡ÉXITO! La Ficha Técnica ha sido guardada en la base de datos correctamente.');

          this.mensajeExito = '¡Ficha Técnica de Control aperturada con éxito!';
          this.mensajeError = '';
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.limpiarFormulario();
          this.cargarCatalogoMaestro(); // Refresca el combo para actualizar la UI
          
          setTimeout(() => {
            this.router.navigate(['inventario/nuevo-kardex']);
          }, 5000);
        },
        error: (err: any) => {
          console.error('Fallo al registrar en Neon:', err);
          
          this.mensajeError = 'No se pudo registrar la ficha técnica en el servidor.';
          this.mensajeExito = '';
        }
      });
  }

  limpiarFormulario(): void {
    this.kardexRequest = {
      idProducto: null,
      unidadMedida: '',
      categoria: '',
      subcategoria: '',
      stockMinimo: null,
      ubicacionAlmacen: '',
      caracteristicas: ''
    };
    this.productoSeleccionado = null;
  }

}
