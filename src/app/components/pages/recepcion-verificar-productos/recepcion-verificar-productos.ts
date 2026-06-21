import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { OrdenResponseDTO } from '../../../api/response/ordenResponseDTO';
import { Recepcion } from '../../../services/recepcion';

@Component({
  selector: 'app-recepcion-verificar-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recepcion-verificar-productos.html',
  styleUrl: './recepcion-verificar-productos.scss',
})
export class RecepcionVerificarProductosComponent implements OnInit {

  ordenes: OrdenResponseDTO[] = [];
  ordenSeleccionada?: OrdenResponseDTO;

  cargando = false;
  mensaje = '';
  error = '';

  busqueda = '';
  estadoFiltro = '';
  fechaFiltro = '';

  productosVerificados: { [idDetalle: number]: boolean } = {};
  incidencias: { [idDetalle: number]: string } = {};

  constructor(private recepcionService: Recepcion) {}

  ngOnInit(): void {
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.recepcionService.listarOrdenesParaVerificacion().subscribe({
      next: (data) => {
        console.log('ÓRDENES RECIBIDAS EN RECEPCIÓN:', data);

        const ordenesNormalizadas = data.map(orden => ({
          ...orden,
          detalles: orden.detalles || []
        }));

        const enviadasConDetalle = ordenesNormalizadas.filter(orden =>
          orden.estado === 'ENVIADA' &&
          orden.detalles.length > 0
        );

        const ordenesConDetalleNoCanceladas = ordenesNormalizadas.filter(orden =>
          orden.detalles.length > 0 &&
          orden.estado !== 'CANCELADA'
        );

        this.ordenes = enviadasConDetalle.length > 0
          ? enviadasConDetalle
          : ordenesConDetalleNoCanceladas;

        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar órdenes para recepción:', error);
        this.error = 'No se pudieron cargar las órdenes para verificación.';
        this.cargando = false;
      }
    });
  }

  ordenesFiltradas(): OrdenResponseDTO[] {
    return this.ordenes.filter(orden => {
      const texto = this.busqueda.toLowerCase().trim();

      const coincideBusqueda =
        !texto ||
        orden.codigo?.toLowerCase().includes(texto) ||
        orden.nombreProveedor?.toLowerCase().includes(texto) ||
        orden.rucProveedor?.toLowerCase().includes(texto) ||
        orden.codigoRequerimiento?.toLowerCase().includes(texto);

      const coincideEstado =
        !this.estadoFiltro || orden.estado === this.estadoFiltro;

      const coincideFecha =
        !this.fechaFiltro || orden.fechaCreacion === this.fechaFiltro;

      return coincideBusqueda && coincideEstado && coincideFecha;
    });
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.estadoFiltro = '';
    this.fechaFiltro = '';
  }

  totalEntregasHoy(): number {
    return this.ordenes.length;
  }

  pendientesVerificar(): number {
    return this.ordenes.filter(orden => orden.estado === 'ENVIADA').length;
  }

  totalConformes(): number {
    return Object.values(this.productosVerificados)
      .filter(valor => valor)
      .length;
  }

  totalIncidencias(): number {
    return Object.values(this.incidencias)
      .filter(valor => valor.trim().length > 0)
      .length;
  }

  tieneIncidencias(): boolean {
    return Object.values(this.incidencias)
      .some(valor => valor.trim().length > 0);
  }

  detallesSeleccionados() {
    return this.ordenSeleccionada?.detalles || [];
  }

  seleccionarOrden(orden: OrdenResponseDTO): void {
    this.ordenSeleccionada = {
      ...orden,
      detalles: orden.detalles || []
    };

    this.productosVerificados = {};
    this.incidencias = {};
    this.error = '';
    this.mensaje = '';

    this.detallesSeleccionados().forEach(detalle => {
      this.productosVerificados[detalle.id] = false;
      this.incidencias[detalle.id] = '';
    });
  }

  cerrarDetalle(): void {
    this.ordenSeleccionada = undefined;
    this.productosVerificados = {};
    this.incidencias = {};
    this.error = '';
    this.mensaje = '';
  }

  todosVerificados(): boolean {
    const detalles = this.detallesSeleccionados();

    if (detalles.length === 0) {
      return false;
    }

    return detalles.every(detalle => this.productosVerificados[detalle.id]);
  }

  confirmarRecepcion(): void {
    if (!this.ordenSeleccionada) {
      return;
    }

    if (!this.todosVerificados()) {
      this.error = 'Debes verificar todos los productos antes de confirmar la recepción.';
      this.mensaje = '';
      return;
    }

    const confirmar = confirm('¿Confirmar recepción conforme de la orden?');

    if (!confirmar) {
      return;
    }

    this.recepcionService.recepcionarOrden(this.ordenSeleccionada.idOrden).subscribe({
      next: () => {
        this.mensaje = 'Recepción confirmada correctamente.';
        this.error = '';
        this.ordenSeleccionada = undefined;
        this.cargarOrdenes();
      },
      error: (error) => {
        console.error('Error al confirmar recepción:', error);
        this.error = 'No se pudo confirmar la recepción.';
        this.mensaje = '';
      }
    });
  }

  registrarPedidoPendiente(): void {
    if (!this.ordenSeleccionada) {
      this.error = 'Debes seleccionar una orden.';
      this.mensaje = '';
      return;
    }

    const motivos = Object.values(this.incidencias)
      .filter(motivo => motivo.trim().length > 0);

    if (motivos.length === 0) {
      this.error = 'Debes registrar al menos una incidencia para marcar pedido pendiente.';
      this.mensaje = '';
      return;
    }

    const motivoFinal = motivos.join(' | ');

    console.log('Registrando pedido pendiente:', {
      idOrden: this.ordenSeleccionada.idOrden,
      motivo: motivoFinal
    });

    this.recepcionService.registrarPedidoPendiente(
      this.ordenSeleccionada.idOrden,
      motivoFinal
    ).subscribe({
      next: (respuesta) => {
        console.log('Pedido pendiente registrado:', respuesta);

        this.mensaje = 'Pedido pendiente registrado correctamente.';
        this.error = '';
        this.ordenSeleccionada = undefined;
        this.cargarOrdenes();
      },
      error: (error) => {
        console.error('Error al registrar pedido pendiente:', error);
        this.error = `No se pudo registrar el pedido pendiente. Estado: ${error.status}`;
        this.mensaje = '';
      }
    });
  }
}