import { Component, OnInit } from '@angular/core';
import { KardexService } from '../../../services/kardex.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdencompraService } from '../../../services/ordencompra.service';


@Component({
  selector: 'app-kardex-lista',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './kardex-lista.html',
  styleUrl: './kardex-lista.scss',
})
export class KardexLista implements OnInit{
  inventario: any[] = [];
  historialMovimientos: any[] = [];
  productoSeleccionadoNombre: string = '';
  loadingMovimientos: boolean = false;

  // Variables para el Select Dinámico
  documentosDisponibles: string[] = []; 
  loadingDocumentos: boolean = false;

  // Variables para el Formulario de Nuevo Movimiento (HU10)
  movimientoForm = {
    idProducto: 0,
    tipoMovimiento: 'ENTRADA',
    cantidad: 1,
    documentoReferencia: '',
    observaciones: ''
  };

  constructor(private kardexService: KardexService,
    private ordenService: OrdencompraService
  ) {}

  ngOnInit(): void {
    this.cargarInventario();
  }

  cargarInventario(): void {
    this.kardexService.obtenerInventarioGeneral().subscribe({
      next: (data) => this.inventario = data,
      error: (err) => console.error('Error al obtener el inventario general', err)
    });
  }

  verHistorial(item: any): void {
    console.log('🔎 Fila del Kárdex seleccionada:', item);

    // 2. BÚSQUEDA DEFENSIVA DEL ID (Por si Java no lo mandó como 'idKardex')
     const idSeguro = item.idKardex;

     if (!idSeguro) {
      alert('⚠️ Error en Angular: No se encontró el ID del Kárdex para buscar su historial.');
       return; // Detenemos la ejecución para que no se quede cargando
     }  


    this.productoSeleccionadoNombre = item.nombreProducto;
    this.historialMovimientos = [];
    this.loadingMovimientos = false;

    this.kardexService.obtenerHistorialMovimientos(item.idKardex).subscribe({
      next: (movs) => {
         console.log('Movimientos recibidos:', movs); 
        this.historialMovimientos = movs;
        this.loadingMovimientos = false;

        const modalEl = document.getElementById('modalHistorial');
        if (modalEl) {
        const modal = new (window as any).bootstrap.Modal(modalEl);
        modal.show();
      }
      },
      error: (err) => {
        console.error('Error al cargar movimientos', err);
        this.loadingMovimientos = false;
        alert('Hubo un error en Java al consultar los movimientos. Revisa la consola negra de Spring Boot.');
      }
    });
  }


  // Al dar clic en "Registrar Acción"
  prepararMovimiento(item: any): void {
    this.productoSeleccionadoNombre = item.nombreProducto;
    this.movimientoForm = {
      idProducto: item.idProducto, // Jalamos el id del producto amarrado
      tipoMovimiento: 'ENTRADA',
      cantidad: 1,
      documentoReferencia: '',
      observaciones: ''
    };
    this.onTipoMovimientoChange();
  }


  // 🧠 MAGIA DE LA REGLA DE NEGOCIO: Carga OC si es entrada, PECOSA si es salida
  onTipoMovimientoChange(): void {

    this.documentosDisponibles = [];
    this.movimientoForm.documentoReferencia = ''; 
    this.loadingDocumentos = true;

    if (this.movimientoForm.tipoMovimiento === 'ENTRADA') {
      // CAMBIO: Ya no listamos todas las OC del sistema aquí.
      // Solo permitimos ajustes manuales de entrada (ej. Donaciones, Inventario Inicial).
      this.documentosDisponibles = [
        'AJUSTE-SOBRANTE', 
        'AJUSTE-INVENTARIO-INICIAL',
        'AJUSTE-DONACION',
        'AJUSTE-OTROS'
      ];
      this.loadingDocumentos = false;
    } else {
      // SALIDA: Sigue siendo la misma lógica que planeamos para PECOSAS
      this.loadingDocumentos = false;
      this.documentosDisponibles = [
        'PECOSA-PENDIENTE-POR-PROCESAR',
        'AJUSTE-MERMA',
        'AJUSTE-OTROS'
      ];
    }


    // this.documentosDisponibles = [];
    // this.movimientoForm.documentoReferencia = ''; // Limpiamos la selección
    // this.loadingDocumentos = false;

    // if (this.movimientoForm.tipoMovimiento === 'ENTRADA') {
    //   // Llamamos al Backend para traer solo Órdenes Reales
    //   this.ordenService.listarTodas().subscribe({
    //     next: (ordenes: any[]) => {
    //       // Filtramos para que el Almacenero solo vea OC's Aprobadas o Enviadas (listas para recibir)
    //       this.documentosDisponibles = ordenes
    //         .filter(o => o.estado === 'APROBADA' || o.estado === 'ENVIADA' || o.estado === 'RECIBIDA')
    //         .map(o => o.codigo); // Formateamos a tu gusto
    //       this.loadingDocumentos = false;
    //     },
    //     error: (err) => {
    //       console.error(err);
    //       this.loadingDocumentos = false;
    //     }
    //   });
    // } else {
    //   // Es una SALIDA. Aquí luego conectaremos con el servicio PecosaService.
    //   // Por ahora simulamos la data.
    //   setTimeout(() => {
    //     this.documentosDisponibles = [
    //       'PECOSA-2026-0001 (Área de Sistemas)',
    //       'PECOSA-2026-0002 (RRHH)',
    //       'PECOSA-2026-0003 (Rectorado)'
    //     ];
    //     this.loadingDocumentos = false;
    //   }, 500); // Simulamos un pequeño retraso de red
    // }
  }



  guardarMovimiento(): void {
    if (!this.movimientoForm.documentoReferencia.trim()) {
      alert('⚠️ El documento de referencia (OC o PECOSA) es obligatorio para la auditoría del Kárdex.');
      return;
    }

    if (this.movimientoForm.cantidad <= 0) {
      alert('⚠️ La cantidad debe ser mayor a cero.');
      return;
    }

    this.kardexService.registrarMovimiento(this.movimientoForm).subscribe({
      next: (resp) => {
        alert(resp); // Mensaje de éxito del backend
        this.cargarInventario(); // 🔄 REFRESCADO AUTOMÁTICO: Actualiza los stocks en la tabla al instante
        // Truco para cerrar el modal nativamente mediante código o el botón close de bootstrap
        const closeBtn = document.getElementById('btn-cerrar-modal-mov');
        if(closeBtn) closeBtn.click();
      },
      error: (err) => {
        // Atrapamos el error de "Stock insuficiente" enviado por tu backend
        alert('❌ Error: ' + (err.error?.message || err.error || 'No se pudo registrar el movimiento'));
      }
    });
  }

}
