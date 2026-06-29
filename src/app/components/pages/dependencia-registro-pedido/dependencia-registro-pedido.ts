import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';  
import { CommonModule } from '@angular/common';

import { PedidoService } from '../../../services/pedido.service';
import { ProductoService } from '../../../services/producto.service';
import { PedidoResponseDTO } from '../../../api/response/pedido-responseDTO';
import { PedidoRequestDTO } from '../../../api/request/pedido-requestDTO';
import { ItemFilaPedido } from '../../../models/registro_pedido/pedido';
import { productoResponseDTO } from '../../../api/response/productoResponseDTO';

@Component({
  selector: 'app-dependencia-registro-pedido',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    FormsModule, 
    NgbTooltipModule     
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

  pedidoForm!: FormGroup;   
  articuloForm!: FormGroup; 

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

  initFormularios(): void {
    const regexJustificacion = /^(?!\s*$).{10,200}$/;
    const regexEnteroPositivo = /^[1-9]\d*$/; 

    this.pedidoForm = this.fb.group({
      descripcionGeneral: ['', [Validators.required, Validators.pattern(regexJustificacion)]]
    });

    this.articuloForm = this.fb.group({
      idProductoSeleccionado: ['', Validators.required],
      // Modificado: Agregado el tope Validators.max(100)
      cantidadIngresada: [1, [Validators.required, Validators.min(1), Validators.max(100), Validators.pattern(regexEnteroPositivo)]],
      observacionIndividual: ['', Validators.maxLength(100)]
    });
  }

  get f() { return this.pedidoForm.controls; }
  get a() { return this.articuloForm.controls; }

  // 🔥 Filtro de teclado: Evita la entrada de caracteres decimales, negativos o exponenciales en caliente
  bloquearTeclasInvalidas(event: KeyboardEvent): void {
    const teclasProhibidas = ['.', ',', '-', '+', 'e', 'E'];
    if (teclasProhibidas.includes(event.key)) {
      event.preventDefault();
    }
  }

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

  agregarProductoALista(): void {
    if (this.articuloForm.invalid) {
      this.articuloForm.markAllAsTouched();
      return;
    }

    const productoSelected: productoResponseDTO = this.articuloForm.value.idProductoSeleccionado;
    const cantidad = this.articuloForm.value.cantidadIngresada;
    const observacion = this.articuloForm.value.observacionIndividual;
    
    const yaExiste = this.detallesPedido.some(item => item.idProducto === productoSelected.idProducto);
    if (yaExiste) {
      this.articuloForm.controls['idProductoSeleccionado'].setErrors({ yaAñadido: true });
      alert('Este artículo ya ha sido añadido a la lista actual.');
      return;
    }

    this.detallesPedido.push({
      idProducto: productoSelected.idProducto,
      nombreProducto: productoSelected.nombre,
      unidadMedida: productoSelected.unidadMedida,
      cantidad: cantidad,
      observacionEspecifica: observacion
    });

    this.articuloForm.reset({
      idProductoSeleccionado: '',
      cantidadIngresada: 1,
      observacionIndividual: ''
    });
  }

  onCantidadInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    
    // Normalización dinámica para evitar evasiones de límites por teclado externo
    if (isNaN(value) || value < 1) {
      value = 1;
    } else if (value > 100) {
      value = 100;
    }
    this.detallesPedido[index].cantidad = value;
    input.value = value.toString(); // Sincroniza la visualización del input
  }

  onObservacionInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    this.detallesPedido[index].observacionEspecifica = input.value;
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

    // 🔥 Validación del segundo input (Grilla): Verifica cada elemento antes de despachar
    const regexEntero = /^[1-9]\d*$/;
    for (let i = 0; i < this.detallesPedido.length; i++) {
      const item = this.detallesPedido[i];
      const cantidadStr = item.cantidad.toString();

      if (!regexEntero.test(cantidadStr) || item.cantidad < 1 || item.cantidad > 100) {
        alert(`Error en el ítem N° ${i + 1} (${item.nombreProducto}): Solo se aceptan números enteros entre 1 y 100.`);
        return; // Detiene el envío por completo
      }
    }
  
    const nuevoPedidoDTO: PedidoRequestDTO = {
      descripcion: this.pedidoForm.value.descripcionGeneral.trim(),
      detalles: this.detallesPedido.map((item) => ({
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