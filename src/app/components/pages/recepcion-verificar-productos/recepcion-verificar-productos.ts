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

      console.log('Órdenes recibidas:', data);

      this.ordenes = data;

      this.cargando = false;
    },
    error: () => {
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
        orden.rucProveedor?.toLowerCase().includes(texto);

      const coincideEstado =
        !this.estadoFiltro || orden.estado === this.estadoFiltro;

      const coincideFecha =
        !this.fechaFiltro || orden.fechaCreacion === this.fechaFiltro;

      return coincideBusqueda && coincideEstado && coincideFecha;
    });
  }

  totalEntregasHoy(): number {
    return this.ordenes.length;
  }

  pendientesVerificar(): number {
    return this.ordenes.filter(orden => orden.estado === 'ENVIADA').length;
  }

  totalIncidencias(): number {
    return Object.values(this.incidencias)
      .filter(valor => valor.trim().length > 0)
      .length;
  }

  seleccionarOrden(orden: OrdenResponseDTO): void {
    this.ordenSeleccionada = orden;
    this.productosVerificados = {};
    this.incidencias = {};
    this.error = '';
    this.mensaje = '';

    const detalles = orden.detalles || [];

    detalles.forEach(detalle => {
      this.productosVerificados[detalle.id] = false;
      this.incidencias[detalle.id] = '';
    });
  }

  todosVerificados(): boolean {
    if (!this.ordenSeleccionada || !this.ordenSeleccionada.detalles || this.ordenSeleccionada.detalles.length === 0) {
      return false;
    }

    return this.ordenSeleccionada.detalles.every(
      detalle => this.productosVerificados[detalle.id]
    );
  }

  confirmarRecepcion(): void {
    if (!this.ordenSeleccionada) {
      return;
    }

    if (!this.todosVerificados()) {
      this.error = 'Debes verificar todos los productos antes de confirmar la recepción.';
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
      error: () => {
        this.error = 'No se pudo confirmar la recepción.';
      }
    });
  }

  registrarPedidoPendiente(): void {
    if (!this.ordenSeleccionada) {
      return;
    }

    const motivos = Object.values(this.incidencias)
      .filter(motivo => motivo.trim().length > 0);

    if (motivos.length === 0) {
      this.error = 'Debes registrar al menos una incidencia para marcar pedido pendiente.';
      return;
    }

    const motivoFinal = motivos.join(' | ');

    this.recepcionService.registrarPedidoPendiente(
      this.ordenSeleccionada.idOrden,
      motivoFinal
    ).subscribe({
      next: () => {
        this.mensaje = 'Pedido pendiente registrado correctamente.';
        this.error = '';
        this.ordenSeleccionada = undefined;
        this.cargarOrdenes();
      },
      error: () => {
        this.error = 'No se pudo registrar el pedido pendiente.';
      }
    });
  }
}