import { Component, OnInit } from '@angular/core';
import { PedidoService } from '../../../services/pedido.service';
import { PedidoResponseDTO } from '../../../api/response/pedido-responseDTO';
import { PedidoRequestDTO, PedidoDetalleRequestDTO } from '../../../api/request/pedido-requestDTO';
import { ItemFilaPedido, CatalogProducto } from '../../../models/registro_pedido/pedido';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dependencia-registro-pedido',
  standalone: true, // Tu componente es standalone
  imports: [
    CommonModule, // 👈 Agregado aquí
    FormsModule   // 👈 Agregado aquí
  ],
  templateUrl: './dependencia-registro-pedido.html',
  styleUrls: ['./dependencia-registro-pedido.scss']
})
export class DependenciaRegistroPedidoComponent implements OnInit {

  vistaActiva: 'historial' | 'nuevo' = 'historial';

  // Colecciones fuertemente tipadas
  pedidosHistorial: PedidoResponseDTO[] = [];
  productosCatalogo: CatalogProducto[] = [];
  detallesPedido: ItemFilaPedido[] = [];

  // Modelos bindeados al formulario
  descripcionGeneral: string = '';
  idProductoSeleccionado: string = '';
  cantidadIngresada: number = 1;
  observacionIndividual: string = '';

  constructor(private pedidoService: PedidoService) { }

  ngOnInit(): void {
    this.cargarHistorial();
    this.cargarProductosCatalogo();
  }

  cambiarVista(vista: 'historial' | 'nuevo'): void {
    this.vistaActiva = vista;
    if (vista === 'historial') {
      this.cargarHistorial();
      this.limpiarFormulario();
    }
  }

  cargarHistorial(): void {
    this.pedidoService.listarMisPedidos().subscribe({
      next: (data) => this.pedidosHistorial = data,
      error: (err) => console.error('Error al recuperar historial de pedidos', err)
    });
  }

  cargarProductosCatalogo(): void {
    this.pedidoService.obtenerCatalogoProductos().subscribe({
      next: (data) => this.productosCatalogo = data,
      error: (err) => console.error('Error al recuperar catálogo de productos', err)
    });
  }

  agregarProductoALista(): void {
    if (!this.idProductoSeleccionado || this.cantidadIngresada <= 0) {
      alert('Debe seleccionar un producto válido y asignar una cantidad mayor a cero.');
      return;
    }

    const productoJson: CatalogProducto = JSON.parse(this.idProductoSeleccionado);
    
    const yaExiste = this.detallesPedido.some(item => item.idProducto === productoJson.idProducto);
    if (yaExiste) {
      alert('Este artículo ya ha sido añadido a la lista actual.');
      return;
    }

    this.detallesPedido.push({
      idProducto: productoJson.idProducto,
      nombreProducto: productoJson.nombre,
      unidadMedida: productoJson.unidadMedida,
      cantidad: this.cantidadIngresada,
      observacionEspecifica: this.observacionIndividual
    });

    this.idProductoSeleccionado = '';
    this.cantidadIngresada = 1;
    this.observacionIndividual = '';
  }

  eliminarProductoDeLista(index: number): void {
    this.detallesPedido.splice(index, 1);
  }

  guardarPedidoCompleto(): void {
    if (!this.descripcionGeneral.trim()) {
      alert('La justificación o descripción del pedido es requerida.');
      return;
    }
    if (this.detallesPedido.length === 0) {
      alert('La solicitud debe contener al menos un artículo.');
      return;
    }

    // Armamos la estructura de datos exigida exactamente por el DTO Request
    const nuevoPedidoDTO: PedidoRequestDTO = {
      descripcion: this.descripcionGeneral,
      detalles: this.detallesPedido.map((item): PedidoDetalleRequestDTO => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad,
        observacionEspecifica: item.observacionEspecifica || undefined
      }))
    };

    this.pedidoService.crearPedido(nuevoPedidoDTO).subscribe({
      next: () => {
        alert('Pedido enviado a procesamiento de abastecimiento correctamente.');
        this.cambiarVista('historial');
      },
      error: (err) => {
        console.error('Error en el envío del pedido', err);
        alert('No se pudo registrar el pedido en el servidor.');
      }
    });
  }

  limpiarFormulario(): void {
    this.descripcionGeneral = '';
    this.detallesPedido = [];
    this.idProductoSeleccionado = '';
    this.cantidadIngresada = 1;
    this.observacionIndividual = '';
  }
}