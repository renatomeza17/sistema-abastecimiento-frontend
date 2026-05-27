import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequerimientoService } from '../../../services/requerimiento.service';
import { RequerimientoRequestDTO } from '../../../api/request/requerimiento-request';
import { RequerimientoResponseDTO } from '../../../api/response/requerimiento-response';

@Component({
  selector: 'app-requerimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './requerimiento.html',
  styleUrls: ['./requerimiento.scss']
})
export class RequerimientosComponent implements OnInit {

  // ── Vista activa ────────────────────────────────────────────
  vistaActiva: 'lista' | 'nuevo' = 'lista';

  // ── Lista ───────────────────────────────────────────────────
  listaRequerimientos: RequerimientoResponseDTO[] = [];
  cargando = false;

  // ── Formulario nuevo requerimiento ──────────────────────────
  descripcionNueva = '';
  productosSeleccionados: { idProducto: number; nombre: string; cantidad: number }[] = [];

  // ── Inputs temporales para agregar producto ─────────────────
  idProductoInput: number | null = null;
  nombreProductoInput = '';
  cantidadInput: number | null = null;

  // ── Feedback ────────────────────────────────────────────────
  mensajeExito = '';
  mensajeError = '';

  constructor(private requerimientoService: RequerimientoService) {}

  ngOnInit(): void {
    this.cargarRequerimientos();
  }

  // ── Carga la lista ──────────────────────────────────────────
  cargarRequerimientos(): void {
    this.cargando = true;
    this.requerimientoService.listar().subscribe({
      next: (data) => { this.listaRequerimientos = data; this.cargando = false; },
      error: (err) => { console.error(err); this.cargando = false; }
    });
  }

  // ── Agrega producto a la lista temporal ─────────────────────
  agregarProducto(): void {
    if (!this.idProductoInput || !this.cantidadInput || this.cantidadInput <= 0) {
      this.mensajeError = 'Ingresa un ID de producto y cantidad válidos.';
      return;
    }
    const yaExiste = this.productosSeleccionados.find(p => p.idProducto === this.idProductoInput);
    if (yaExiste) {
      this.mensajeError = 'Ese producto ya fue agregado.';
      return;
    }
    this.productosSeleccionados.push({
      idProducto: this.idProductoInput,
      nombre: this.nombreProductoInput || `Producto #${this.idProductoInput}`,
      cantidad: this.cantidadInput
    });
    this.idProductoInput = null;
    this.nombreProductoInput = '';
    this.cantidadInput = null;
    this.mensajeError = '';
  }

  // ── Elimina producto de la lista temporal ───────────────────
  removerProducto(index: number): void {
    this.productosSeleccionados.splice(index, 1);
  }

  // ── Envía el requerimiento al backend ───────────────────────
  guardarRequerimiento(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.descripcionNueva.trim()) {
      this.mensajeError = 'La descripción es obligatoria.';
      return;
    }
    if (this.productosSeleccionados.length === 0) {
      this.mensajeError = 'Agrega al menos un producto.';
      return;
    }

    const dto: RequerimientoRequestDTO = {
      descripcion: this.descripcionNueva.trim(),
      detalles: this.productosSeleccionados.map(p => ({
        idProducto: p.idProducto,
        cantidad: p.cantidad
      }))
    };

    this.requerimientoService.crear(dto).subscribe({
      next: (res) => {
        this.mensajeExito = `Requerimiento ${res.codigo} creado exitosamente.`;
        this.descripcionNueva = '';
        this.productosSeleccionados = [];
        this.cargarRequerimientos();
        setTimeout(() => { this.vistaActiva = 'lista'; this.mensajeExito = ''; }, 1500);
      },
      error: (err) => {
        console.error(err);
        this.mensajeError = 'Error al crear el requerimiento. Revisa la consola.';
      }
    });
  }

  getEstadoClass(estado: string): string {
    const map: { [k: string]: string } = {
      'PENDIENTE':   'badge-pendiente',
      'EN_PROCESO':  'badge-proceso',
      'APROBADO':    'badge-aprobado',
      'CANCELADO':   'badge-cancelado'
    };
    return map[estado] || 'bg-secondary';
  }
}