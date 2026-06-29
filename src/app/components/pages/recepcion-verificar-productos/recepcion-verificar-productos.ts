import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { OrdenResponseDTO } from '../../../api/response/ordenResponseDTO';
import { Recepcion } from '../../../services/recepcion';
import { KardexService } from '../../../services/kardex.service';

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

  inventarioGeneral: any[] = [];
  kardexErrors: string[] = [];

  constructor(
    private recepcionService: Recepcion,
    private kardexService: KardexService
  ) {}

  ngOnInit(): void {
    this.cargarOrdenes();
    this.cargarInventario();
  }

  cargarInventario(): void {
    this.kardexService.obtenerInventarioGeneral().subscribe({
      next: (data) => this.inventarioGeneral = data,
      error: () => console.warn('No se pudo cargar inventario kardex')
    });
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
        this.kardexErrors = [];
        this.registrarMovimientosKardex();
      },
      error: (error) => {
        console.error('Error al confirmar recepción:', error);
        this.error = 'No se pudo confirmar la recepción.';
        this.mensaje = '';
      }
    });
  }

  registrarMovimientosKardex(): void {
    if (!this.ordenSeleccionada) return;

    const orden = this.ordenSeleccionada;
    const pendientes = orden.detalles.filter(d => this.productosVerificados[d.id]);
    let completados = 0;

    if (pendientes.length === 0) {
      this.mensaje = 'Recepción confirmada correctamente.';
      this.ordenSeleccionada = undefined;
      this.cargarOrdenes();
      this.cargarInventario();
      return;
    }

    pendientes.forEach(detalle => {
      this.registrarEntradaConKardex(detalle, orden, () => {
        completados++;
        if (completados === pendientes.length) this.finalizarRecepcion();
      });
    });
  }

  private registrarEntradaConKardex(detalle: any, orden: any, onComplete: () => void): void {
    const kardex = this.inventarioGeneral.find(
      (k: any) => k.idProducto === detalle.productoId
    );

    if (kardex) {
      this.crearMovimientoEntrada(detalle, orden, onComplete);
    } else {
      this.crearFichaKardex(detalle, orden, onComplete);
    }
  }

  private crearFichaKardex(detalle: any, orden: any, onComplete: () => void): void {
    const payload = {
      idProducto: detalle.productoId,
      stockMinimo: 5,
      ubicacionAlmacen: 'Por definir',
      caracteristicas: `Ficha creada automáticamente al recepcionar OC ${orden.codigo}`
    };

    this.kardexService.crearNuevoAsiento(payload).subscribe({
      next: () => {
        this.inventarioGeneral.push({
          idProducto: detalle.productoId,
          nombreProducto: detalle.nombreProducto,
          stockActual: 0
        });
        this.crearMovimientoEntrada(detalle, orden, onComplete);
      },
      error: (err) => {
        this.kardexErrors.push(
          `No se pudo crear ficha kárdex para "${detalle.nombreProducto}": ${err.error?.message || err.error || err.message}`
        );
        onComplete();
      }
    });
  }

  private crearMovimientoEntrada(detalle: any, orden: any, onComplete: () => void): void {
    const payload = {
      idProducto: detalle.productoId,
      tipoMovimiento: 'ENTRADA',
      cantidad: detalle.cantidad,
      documentoReferencia: orden.codigo,
      observaciones: `Recepción OC ${orden.codigo} - Verificación conforme`
    };

    this.kardexService.registrarMovimiento(payload).subscribe({
      next: () => onComplete(),
      error: (err) => {
        this.kardexErrors.push(
          `Error al registrar entrada de "${detalle.nombreProducto}": ${err.error?.message || err.error || err.message}`
        );
        onComplete();
      }
    });
  }

  finalizarRecepcion(): void {
    const msgBase = 'Recepción confirmada correctamente.';
    if (this.kardexErrors.length > 0) {
      this.mensaje = msgBase + ' Algunos productos no se registraron en kárdex. Revisa los errores.';
    } else {
      this.mensaje = msgBase + ' Stock actualizado en kárdex.';
    }
    this.ordenSeleccionada = undefined;
    this.cargarOrdenes();
    this.cargarInventario();
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