import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Recepcion } from '../../../services/recepcion';

@Component({
  selector: 'app-recepcion-pedidos-pendientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recepcion-pedidos-pendientes.html',
  styleUrl: './recepcion-pedidos-pendientes.scss'
})
export class RecepcionPedidosPendientesComponent implements OnInit {

  pedidos: any[] = [];
  pedidoSeleccionado: any;

  busqueda = '';
  estadoFiltro = '';
  mensaje = '';
  error = '';
  cargando = false;
  datosCargados = false;

  constructor(private recepcionService: Recepcion) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
  this.cargando = false;
  this.error = '';
  this.mensaje = '';

  this.recepcionService.listarPedidosPendientes().subscribe({
    next: (data) => {
      this.pedidos = data ?? [];
      this.cargando = false;
    },
    error: (err) => {
      console.error(err);
      this.pedidos = [];
      this.error = 'No se pudieron cargar los pedidos pendientes.';
      this.cargando = false;
    }
  });
}
  pedidosFiltrados(): any[] {

    return this.pedidos.filter(pedido => {

      const texto = this.busqueda.toLowerCase().trim();

      const codigo = pedido.ordenCompra?.codigo ?? '';
      const proveedor = pedido.ordenCompra?.proveedor?.razonSocial ?? '';
      const motivo = pedido.motivo ?? '';

      const coincideBusqueda =
        texto === '' ||
        codigo.toLowerCase().includes(texto) ||
        proveedor.toLowerCase().includes(texto) ||
        motivo.toLowerCase().includes(texto);

      const coincideEstado =
        this.estadoFiltro === '' ||
        pedido.estado === this.estadoFiltro;

      return coincideBusqueda && coincideEstado;

    });

  }

  seleccionarPedido(pedido: any): void {
    this.pedidoSeleccionado = pedido;
  }

  resolverPedido(pedido: any): void {

    if (!confirm('¿Marcar este pedido como resuelto?')) {
      return;
    }

    this.recepcionService.resolverPedidoPendiente(
      pedido.idPedidoPendiente
    ).subscribe({

      next: () => {
        this.mensaje = 'Pedido resuelto correctamente.';
        this.pedidoSeleccionado = undefined;
        this.cargarPedidos();
      },

      error: () => {
        this.error = 'No se pudo resolver el pedido.';
      }

    });

  }

  totalPendientes(): number {
    return this.pedidos.filter(p => p.estado === 'PENDIENTE').length;
  }

  totalResueltos(): number {
    return this.pedidos.filter(p => p.estado === 'RESUELTO').length;
  }

  totalEnProceso(): number {
    return this.pedidos.filter(p => p.estado === 'EN_PROCESO').length;
  }

}