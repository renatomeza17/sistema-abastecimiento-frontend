import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequerimientoService } from '../../../services/requerimiento.service';
import { ProformaService } from '../../../services/proforma.service';
import { RequerimientoResponseDTO } from '../../../api/response/requerimiento-response';
import { ProformaRequestDTO, DetalleProformaRequestDTO } from '../../../api/request/requerimiento-request';

@Component({
  selector: 'app-crear-proforma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './requerimiento-proformas.html',
  styleUrls: ['./requerimiento-proformas.scss']
})
export class CrearProformaComponent implements OnInit {

  // ── Vistas ──────────────────────────────────────────────────
  vistaActiva: 'requerimientos' | 'proformas' | 'cotizar' = 'requerimientos';

  // ── Datos ───────────────────────────────────────────────────
  requerimientosDisponibles: RequerimientoResponseDTO[] = [];
  misProformas: any[] = [];
  requerimientoSeleccionado: RequerimientoResponseDTO | null = null;

  // ── Precios ingresados por el proveedor ─────────────────────
  preciosInput: { [key: number]: number } = {};

  // ── ID simulado del proveedor logueado ──────────────────────
  idProveedorLogueado = 1;

  // ── Feedback ────────────────────────────────────────────────
  cargando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private requerimientoService: RequerimientoService,
    private proformaService: ProformaService
  ) {}

  ngOnInit(): void {
    this.cargarRequerimientos();
  }

  // ── Carga requerimientos PENDIENTE ──────────────────────────
  cargarRequerimientos(): void {
    this.cargando = true;
    this.requerimientoService.listarPorEstado('PENDIENTE').subscribe({
      next: (data) => { this.requerimientosDisponibles = data; this.cargando = false; },
      error: (err) => { console.error(err); this.cargando = false; }
    });
  }
  
  // ── Carga proformas del proveedor logueado ─────────────────────
  cargarMisProformas(): void {
    this.cargando = true;
    // Usamos el nuevo método sin IDs quemados en el Front
    this.proformaService.porProveedorLogueado().subscribe({
      next: (data) => {         
        this.misProformas = data; 
        this.cargando = false; 
      },
      error: (err) => { 
        console.error(err); 
        this.cargando = false; 
      }
    });
  }

  cambiarVista(vista: 'requerimientos' | 'proformas' | 'cotizar'): void {
    this.vistaActiva = vista;
    this.mensajeExito = '';
    this.mensajeError = '';
    if (vista === 'requerimientos') this.cargarRequerimientos();
    if (vista === 'proformas') this.cargarMisProformas();
  }

  // ── Selecciona un requerimiento para cotizar ─────────────────
  cotizar(req: RequerimientoResponseDTO): void {
    this.requerimientoSeleccionado = req;
    this.preciosInput = {};
    req.detalles.forEach(d => this.preciosInput[d.idProducto] = 0);
    this.vistaActiva = 'cotizar';
  }

  // ── Calcula el total de la proforma en tiempo real ───────────
  calcularTotal(): number {
    if (!this.requerimientoSeleccionado) return 0;
    return this.requerimientoSeleccionado.detalles.reduce((acc, d) => {
      return acc + (d.cantidad * (this.preciosInput[d.idProducto] || 0));
    }, 0);
  }

  // ── Envía la proforma al backend con validación de precios ─────────────────
  enviarProforma(): void {
    if (!this.requerimientoSeleccionado) return;

    const preciosValidos = this.requerimientoSeleccionado.detalles
      .every(d => this.preciosInput[d.idProducto] > 0);

    if (!preciosValidos) {
      this.mensajeError = 'Ingresa un precio mayor a 0 para todos los productos.';
      return;
    }

    const productos: DetalleProformaRequestDTO[] =
      this.requerimientoSeleccionado.detalles.map(d => ({
        idProducto: d.idProducto,
        cantidad: d.cantidad,
        precioUnitario: this.preciosInput[d.idProducto]
      }));

    // REFACTORIZADO: Ya no se envía el 'idProveedor' en el cuerpo de la solicitud
    const dto: ProformaRequestDTO = {
      idRequerimiento: this.requerimientoSeleccionado.idRequerimiento,
      fechaRecepcion: new Date().toISOString().split('T')[0],
      productos
    };

    this.proformaService.crear(dto).subscribe({
      next: (res) => {
        this.mensajeExito = `Proforma ${res.codigo} enviada correctamente.`;
        this.mensajeError = '';
        setTimeout(() => {
          this.requerimientoSeleccionado = null;
          this.cambiarVista('proformas');
        }, 1500);
      },
      error: (err) => {
        console.error(err);
        this.mensajeError = 'Error al enviar la proforma.';
      }
    });
  }

  getEstadoClass(estado: string): string {
    const map: { [k: string]: string } = {
      'PENDIENTE':  'badge-pendiente',
      'EN_PROCESO': 'badge-proceso',
      'APROBADO':   'badge-aprobado',
      'CANCELADO':  'badge-cancelado',
      'RECIBIDA':   'badge-recibida',
      'ELEGIDA':    'badge-aprobado',
      'RECHAZADA':  'badge-cancelado'
    };
    return map[estado] || 'bg-secondary';
  }
}