import { Component, OnInit } from '@angular/core';
import { OrdencompraService } from '../../../services/ordencompra.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orden-form',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './orden-form.html',
  styleUrl: './orden-form.scss',
})
export class OrdenForm implements OnInit {
// Estructura limpia para enviar a @RequestBody OrdenRequestDTO de Spring Boot
  ordenRequest: any = {
    nroOrden: '', // Lo generará el backend o se secuencia dinámicamente
    fechaEmision: new Date().toISOString().substring(0, 10), // Fecha de hoy automatizada
    fechaEntrega: '',
    idRequerimiento: null,
    idProforma: null,
    formaPago: '',
    plazoEntrega: '',
    garantia: '',
    lugarEntrega: '',
    observaciones: ''
  };

  // Arreglos dinámicos que se poblarán desde la Base de Datos (Neon)
  requerimientosList: any[] = [];
  proformaList: any[] = [];

  // Objeto reactivo para pintar el proveedor de la proforma seleccionada
  proveedorSeleccionado: any = null;

  // Arreglo de productos que llega dinámicamente desde el backend
  items: any[] = [];

  // Totales calculados en tiempo real matemáticamente
  subtotal: number = 0;
  igv: number = 0;
  total: number = 0;

  constructor(
    private ordenService: OrdencompraService,
    // private requerimientoService: RequerimientoService, // 👈 Inyecta para jalar datos reales de Neon
    // private proformaService: ProformaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCombosDesdeBackend();
  }

  // 1. EXTRAE REQUERIMIENTOS Y PROFORMAS DIRECTAMENTE DEL SERVIDOR
  cargarCombosDesdeBackend(): void {
    // REQUERIMIENTOS REALES:
    // this.requerimientoService.listarActivos().subscribe({
    //   next: (data) => this.requerimientosList = data,
    //   error: (err) => console.error('Error al traer requerimientos:', err)
    // });

    // PROFORMAS REALES:
    // this.proformaService.listarAprobadas().subscribe({
    //   next: (data) => this.proformaList = data,
    //   error: (err) => console.error('Error al traer proformas:', err)
    // });
  }

  // 2. DETECTA EL CAMBIO DE PROFORMA Y SOLICITA SUS ÍTEMS Y PROVEEDOR AL BACKEND
  onProformaChange(): void {
    const idProformaSeleccionada = this.ordenRequest.idProforma;
    
    if (!idProformaSeleccionada) {
      this.limpiarDatosDinamicos();
      return;
    }

    console.log('Solicitando a Spring Boot datos reales de la proforma ID:', idProformaSeleccionada);

    // Consumimos tu método real del servicio conectado al @RequestParam de Java
    this.ordenService.listarPorProveedor(idProformaSeleccionada).subscribe({
      next: (data: any) => {
        console.log('Datos reales recuperados de Neon:', data);
        
        // Mapeamos el proveedor en base a la respuesta del servidor
        this.proveedorSeleccionado = data.proveedor; 
        
        // Autocompletamos los campos del formulario con los acuerdos de la proforma
        this.ordenRequest.plazoEntrega = data.plazoEntrega || '15 días hábiles';
        this.ordenRequest.garantia = data.garantia || '12 meses';

        // Mapeamos los ítems dinámicos de la base de datos a la tabla
        this.items = data.items.map((item: any, index: number) => ({
          num: index + 1,
          codigo: item.codigoProducto || item.producto.codigo,
          descripcion: item.nombreProducto || item.producto.descripcion,
          unidad: item.unidadMedida || 'Unidad',
          cantidad: item.cantidad,
          precioUnit: item.precioUnitario || item.precio,
          subtotal: item.cantidad * (item.precioUnitario || item.precio)
        }));

        this.calcularTotales();
      },
      error: (err) => {
        console.error('Error crítico al consultar datos de proforma en el Backend:', err);
        this.limpiarDatosDinamicos();
      }
    });
  }

  // 3. OPERACIÓN MATEMÁTICA REACTIVA SIN INTERFERENCIA DE DATOS FIJOS
  calcularTotales(): void {
    let sumaSubtotales = 0;
    this.items.forEach(item => {
      item.subtotal = item.cantidad * item.precioUnit;
      sumaSubtotales += item.subtotal;
    });

    this.subtotal = sumaSubtotales;
    this.igv = this.subtotal * 0.18; // Impuesto general de ley
    this.total = this.subtotal + this.igv;
  }

  limpiarDatosDinamicos(): void {
    this.proveedorSeleccionado = null;
    this.items = [];
    this.subtotal = 0;
    this.igv = 0;
    this.total = 0;
  }

  // 4. POSTEA EL PAYLOAD COMPLETO A TU CONTROLADOR DE SPRING BOOT
  guardarOrden(): void {
    if (!this.ordenRequest.idProforma || !this.ordenRequest.fechaEntrega || !this.ordenRequest.lugarEntrega) {
      alert('Por favor, completa los campos requeridos: Proforma, Fecha y Lugar de Entrega.');
      return;
    }

    // Unificamos el formulario básico con las listas dinámicas e importes numéricos finales
    const payloadFinal = {
      ...this.ordenRequest,
      subtotal: this.subtotal,
      igv: this.igv,
      total: this.total,
      items: this.items // Envía el desglose de productos al backend
    };

    console.log('Payload JSON real enviado al POST:', payloadFinal);

    this.ordenService.crearOrden(payloadFinal).subscribe({
      next: (response) => {
        console.log('Orden guardada en Neon con éxito:', response);
        alert('¡Orden de Compra generada de forma exitosa en el sistema!');
        this.router.navigate(['/compras/lista']); // Redirección automática a tu tabla limpia
      },
      error: (err) => {
        console.error('Fallo en la inserción HTTP POST en Spring Boot:', err);
        alert('Hubo un error al guardar en la base de datos. Revisa la consola.');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/compras/lista']);
  }
}
