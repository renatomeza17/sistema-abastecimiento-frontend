import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms'; // 👈 Agregados para Reactive Forms
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';  // 👈 Herramienta Tooltip de ng-bootstrap
import { FormsModule } from '@angular/forms'; // 👈 1. Importa esto arriba
import { CommonModule } from '@angular/common';

import { PedidoService } from '../../../services/pedido.service';
import { ProductoService } from '../../../services/producto.service';
import { PedidoResponseDTO } from '../../../api/response/pedido-responseDTO';
import { PedidoRequestDTO, PedidoDetalleRequestDTO } from '../../../api/request/pedido-requestDTO';
import { ItemFilaPedido } from '../../../models/registro_pedido/pedido';
import { productoResponseDTO } from '../../../api/response/productoResponseDTO';

@Component({
  selector: 'app-dependencia-registro-pedido',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // 👈 Se reemplaza FormsModule por ReactiveFormsModule
    FormsModule, // 👈 Se reemplaza FormsModule por ReactiveFormsModule
    NgbTooltipModule     // 👈 Módulo para el toolstrip (tooltips dinámicos)
  ],
  templateUrl: './dependencia-registro-pedido.html',
  styleUrls: ['./dependencia-registro-pedido.scss']
})
export class DependenciaRegistroPedidoComponent implements OnInit {

  vistaActiva: 'historial' | 'nuevo' = 'historial';

  pedidosHistorial: PedidoResponseDTO[] = [];
  productosCatalogo: productoResponseDTO[] = [];
  detallesPedido: ItemFilaPedido[] = [];
  pedidoSeleccionado: PedidoResponseDTO | undefined;

  // 1. Declaración de Grupos de Formularios Reactivos
  pedidoForm!: FormGroup;   // Formulario de los datos generales
  articuloForm!: FormGroup; // Formulario del bloque agregador de artículos

  constructor(
    private fb: FormBuilder,
    private pedidoService: PedidoService, 
    private productoService: ProductoService
  ) { }

  ngOnInit(): void {
    this.initFormularios();
    this.cargarHistorial();
    this.cargarProductosCatalogo();
  }

  // 2. Inicialización del estado reactivo del formulario
  initFormularios(): void {
    // Regex: Mínimo 10 caracteres, no permite que sean únicamente espacios en blanco
    const regexJustificacion = /^(?!\s*$).{10,500}$/;

    this.pedidoForm = this.fb.group({
      descripcionGeneral: ['', [Validators.required, Validators.pattern(regexJustificacion)]]
    });

    this.articuloForm = this.fb.group({
      idProductoSeleccionado: ['', Validators.required],
      cantidadIngresada: [1, [Validators.required, Validators.min(1)]],
      observacionIndividual: ['', Validators.maxLength(100)]
    });
  }

  // Getters auxiliares para simplificar el código en el HTML
  get f() { return this.pedidoForm.controls; }
  get a() { return this.articuloForm.controls; }

  cambiarVista(vista: 'historial' | 'nuevo'): void {
    this.vistaActiva = vista;
    this.pedidoSeleccionado = undefined;
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
    this.productoService.obtenerCatalogoProductos().subscribe({
      next: (data) => this.productosCatalogo = data,
      error: (err) => console.error('Error al recuperar catálogo de productos', err)
    });
  }

  // 3. Controladores y eventos del Formulario Reactivo
  agregarProductoALista(): void {
    // Marcamos como tocados para disparar validaciones visuales si está incompleto
    if (this.articuloForm.invalid) {
      this.articuloForm.markAllAsTouched();
      return;
    }

    const productoJson: productoResponseDTO = JSON.parse(this.articuloForm.value.idProductoSeleccionado);
    const cantidad = this.articuloForm.value.cantidadIngresada;
    const observacion = this.articuloForm.value.observacionIndividual;
    
    const yaExiste = this.detallesPedido.some(item => item.idProducto === productoJson.idProducto);
    if (yaExiste) {
      this.articuloForm.controls['idProductoSeleccionado'].setErrors({ yaAñadido: true });
      alert('Este artículo ya ha sido añadido a la lista actual.');
      return;
    }

    this.detallesPedido.push({
      idProducto: productoJson.idProducto,
      nombreProducto: productoJson.nombre,
      unidadMedida: productoJson.unidadMedida,
      cantidad: cantidad,
      observacionEspecifica: observacion
    });

    // Resetear formulario de artículos preservando valores iniciales por defecto
    this.articuloForm.reset({
      idProductoSeleccionado: '',
      cantidadIngresada: 1,
      observacionIndividual: ''
    });
  }

  // Evento Input: Filtra dinámicamente si el usuario escribe valores menores a 1 en caliente
  onCantidadInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    if (isNaN(value) || value < 1) {
      value = 1;
    }
    this.detallesPedido[index].cantidad = value;
  }

  eliminarProductoDeLista(index: number): void {
    this.detallesPedido.splice(index, 1);
  }

  guardarPedidoCompleto(): void {
    if (this.pedidoForm.invalid) {
      this.pedidoForm.markAllAsTouched();
      return;
    }

    if (this.detallesPedido.length === 0) {
      alert('La solicitud debe contener al menos un artículo en la lista.');
      return;
    }
  
    const nuevoPedidoDTO: PedidoRequestDTO = {
      descripcion: this.pedidoForm.value.descripcionGeneral.trim(),
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

  verDetalles(pedido: PedidoResponseDTO): void {
    this.pedidoSeleccionado = pedido;
    setTimeout(() => {
      const detalleEl = document.getElementById('detalle-pedido');
      if (detalleEl) {
        detalleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  cerrarDetalles(): void {
    this.pedidoSeleccionado = undefined;
  }
  
  limpiarFormulario(): void {
    this.pedidoForm.reset();
    this.articuloForm.reset({
      idProductoSeleccionado: '',
      cantidadIngresada: 1,
      observacionIndividual: ''
    });
    this.detallesPedido = [];
  }
}