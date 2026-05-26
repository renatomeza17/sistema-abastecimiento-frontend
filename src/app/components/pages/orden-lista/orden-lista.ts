import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OrdenResponseDTO } from '../../../api/response/ordenResponseDTO';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { OrdencompraService } from '../../../services/ordencompra.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';

@Component({
  selector: 'app-orden-lista',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './orden-lista.html',
  styleUrl: './orden-lista.scss',
})
export class OrdenLista implements OnInit {

  ordenes: OrdenResponseDTO[] = [];
  ordenesFiltradas: OrdenResponseDTO[] = [];
  
  // Variables de control visual
  terminoBusqueda: string = '';
  estadoSeleccionado: string = '';
  dependenciaSeleccionada: string = '';
  
  // Datos del rol para la visualización dinámica
  rolUsuario: string = '';

  constructor(
    private ordenService: OrdencompraService,
    public authService: AuthService, // public para usarlo en el HTML
    private router: Router,
    private cdr: ChangeDetectorRef

  ) {// Este bloque detecta cuando haces clic en el Sidebar e ingresas a la ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      console.log('Ruta cambiada detectada en OrdenLista, recargando datos...');
      this.cargarOrdenes();
    });}

  ngOnInit(): void {
    // Obtener el rol del usuario desde el LocalStorage a través de tu AuthService
    this.rolUsuario = this.authService.isLoggedIn() ? localStorage.getItem('roles') || '' : '';
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    // Si el usuario es un proveedor externo logueado, usar endpoint por Proveedor
    if (this.authService.hasRole('ROLE_PROVEEDOR')) {
      const idProveedor = Number(localStorage.getItem('idProveedor')); // Suponiendo que lo guardas en el login
      this.ordenService.listarPorProveedor(idProveedor).subscribe({
        next: (data) => {
          this.ordenes = data;
          this.ordenesFiltradas = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al cargar órdenes de proveedor', err)
      });
    } else {
      // Flujo interno de la universidad (Jefe, Director, Almacén)
      this.ordenService.listarTodas().subscribe({
        next: (data) => {
          this.ordenes = data;
          this.ordenesFiltradas = data;
        },
        error: (err) => console.error('Error al cargar todas las órdenes', err)
      });
    }
  }

  // Métodos para cambiar los estados comunicándose con tu Backend
  aprobarOrden(id: number): void {
    if (confirm('¿Está seguro de firmar y aprobar esta Orden de Compra?')) {
      this.ordenService.aprobarOrden(id).subscribe({
        next: () => {
          alert('Orden aprobada exitosamente.');
          this.cargarOrdenes(); // Recargar tabla
        },
        error: (err) => alert('Error al aprobar orden: ' + err.error)
      });
    }
  }

  enviarAlProveedor(id: number): void {
    if (confirm('¿Desea despachar y enviar esta Orden de Compra al proveedor asignado?')) {
      this.ordenService.enviarOrden(id).subscribe({
        next: () => {
          alert('Orden enviada al portal del proveedor con éxito.');
          this.cargarOrdenes();
        },
        error: (err) => alert('Error al enviar orden: ' + err.error)
      });
    }
  }

  archivarOrden(id: number): void {
    if (confirm('¿Verificó los productos en Almacén? ¿Proceder a archivar y cerrar la OC?')) {
      this.ordenService.archivarOrden(id).subscribe({
        next: () => {
          alert('Orden de Compra archivada. Inventario Kardex actualizado.');
          this.cargarOrdenes();
        },
        error: (err) => alert('Error al archivar orden: ' + err.error)
      });
    }
  }

  verDetalle(id: number): void {
    this.router.navigate(['/ordenes/detalle', id]); // Redirige al visor de impresión HU05
  }

  // Métodos de conteo para tus tarjetas estadísticas superiores
  getContarPorEstado(estado: string): number {
    return this.ordenes.filter(o => o.estado === estado).length;
  }

  // Filtrado reactivo en el Frontend
  aplicarFiltros(): void {
    this.ordenesFiltradas = this.ordenes.filter(o => {
      const matchBusqueda = o.codigo.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
                            o.nombreProveedor.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
                            o.codigoRequerimiento.toLowerCase().includes(this.terminoBusqueda.toLowerCase());
      
      const matchEstado = this.estadoSeleccionado ? o.estado === this.estadoSeleccionado : true;
      
      return matchBusqueda && matchEstado;
    });
  }



  // ordenes: OrdenResponseDTO[] = [];
  
  // // 💡 TIP: Cambia este valor a 'DIRECTOR_ADMINISTRATIVO', 'JEFE_ABASTECIMIENTO' o 'ALMACENERO'
  // // en tus pruebas para ver cómo mutan los botones de la tabla según las acciones de tu backend.
  // rolUsuarioLogueado: string = 'JEFE_ABASTECIMIENTO'; 

  // constructor(
  //   private ordenService: OrdencompraService,
  //   private router: Router
  // ) { }

  // ngOnInit(): void {
  //   this.cargarOrdenes();
  // }

  // cargarOrdenes(): void {
  //   this.ordenService.listarTodas().subscribe({
  //     next: (data) => this.ordenes = data,
  //     error: (err) => console.error('Error al recuperar datos de la API', err)
  //   });
  // }

  // aprobar(id: number): void {
  //   this.ordenService.aprobarOrden(id).subscribe({
  //     next: (mensaje) => {
  //       alert(mensaje);
  //       this.cargarOrdenes(); // Refresca la tabla automáticamente
  //     }
  //   });
  // }

  // enviar(id: number): void {
  //   this.ordenService.enviarOrden(id).subscribe({
  //     next: () => {
  //       alert('Orden despachada al portal del proveedor correctamente.');
  //       this.cargarOrdenes();
  //     }
  //   });
  // }

  // archivar(id: number): void {
  //   this.ordenService.archivarOrden(id).subscribe({
  //     next: (mensaje) => {
  //       alert(mensaje);
  //       this.cargarOrdenes();
  //     }
  //   });
  // }

  // verDetalle(id: number): void {
  //   // Te redirige a la ruta del segundo componente pasando el ID por la URL
  //   this.router.navigate(['/ordenes/detalle', id]);
  // }
}
