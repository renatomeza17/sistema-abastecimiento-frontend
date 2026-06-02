import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequerimientoService } from '../../../services/requerimiento.service';
import { ProformaService } from '../../../services/proforma.service';
import { RequerimientoResponseDTO, ProformaResponseDTO } from '../../../api/response/requerimiento-response';

@Component({
  selector: 'app-evaluar-proformas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './requerimiento-comparar-proformas.html',
  styleUrls: ['./requerimiento-comparar-proformas.scss']
})
export class EvaluarProformasComponent implements OnInit {

  requerimientos: RequerimientoResponseDTO[] = [];
  proformasCandidatas: ProformaResponseDTO[] = [];
  reqSeleccionado: RequerimientoResponseDTO | null = null;
  cargandoReqs = false;
  cargandoProformas = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private requerimientoService: RequerimientoService,
    private proformaService: ProformaService
  ) {}

  ngOnInit(): void {
    this.cargarRequerimientos();
  }

  cargarRequerimientos(): void {
    this.cargandoReqs = true;
    this.requerimientoService.listar().subscribe({
      next: (data) => { this.requerimientos = data; this.cargandoReqs = false; },
      error: (err) => { console.error(err); this.cargandoReqs = false; }
    });
  }

  verProformas(req: RequerimientoResponseDTO): void {
    this.reqSeleccionado = req;
    this.proformasCandidatas = [];
    this.mensajeExito = '';
    this.mensajeError = '';
    this.cargandoProformas = true;

    this.proformaService.porRequerimiento(req.idRequerimiento).subscribe({
      next: (data) => { this.proformasCandidatas = data; this.cargandoProformas = false; },
      error: (err) => { console.error(err); this.cargandoProformas = false; }
    });
  }

  elegirProforma(idProforma: number): void {
    if (!confirm('¿Está seguro de seleccionar esta proforma como la mejor opción?')) return;

    this.proformaService.elegir(idProforma).subscribe({
      next: (res) => {
        this.mensajeExito = `Proforma ${res.codigo} seleccionada. Pasando a firma del Director.`;
        if (this.reqSeleccionado) this.verProformas(this.reqSeleccionado);
      },
      error: (err) => {
        console.error(err);
        this.mensajeError = 'Error al seleccionar la proforma.';
      }
    });
  }

  // Identifica la proforma de menor precio
  esMenorPrecio(prof: ProformaResponseDTO): boolean {
    if (this.proformasCandidatas.length <= 1) return false;
    const minPrecio = Math.min(...this.proformasCandidatas.map(p => p.precioTotal));
    return prof.precioTotal === minPrecio;
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