import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequerimientoService } from '../../../services/requerimiento.service';
import { RequerimientoResponseDTO } from '../../../api/response/requerimiento-response';

@Component({
  selector: 'app-firma-requerimiento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './firma-requerimiento.html',
  styleUrls: ['./firma-requerimiento.scss']
})
export class FirmaRequerimientosComponent implements OnInit {

  requerimientosParaFirma: RequerimientoResponseDTO[] = [];
  cargando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(private requerimientoService: RequerimientoService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.requerimientoService.listarPorEstado('EN_PROCESO').subscribe({
      next: (data) => { this.requerimientosParaFirma = data; this.cargando = false; },
      error: (err) => { console.error(err); this.cargando = false; }
    });
  }

  procesarFirma(id: number, aprobado: boolean): void {
    const nuevoEstado = aprobado ? 'APROBADO' : 'CANCELADO';
    const accion = aprobado ? 'firmar y aprobar' : 'cancelar';

    if (!confirm(`¿Está seguro de ${accion} este requerimiento?`)) return;

    this.mensajeExito = '';
    this.mensajeError = '';

    this.requerimientoService.cambiarEstado(id, nuevoEstado).subscribe({
      next: (res) => {
        this.mensajeExito = `Requerimiento ${res.codigo} actualizado a: ${nuevoEstado}.`;
        this.cargar();
      },
      error: (err) => {
        console.error(err);
        this.mensajeError = 'Error al procesar la firma.';
      }
    });
  }
}