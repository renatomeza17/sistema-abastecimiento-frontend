import { RequerimientoDetalle } from "./RequerimientoDetalle";

export interface Requerimiento {
  idRequerimiento?: number;
  codigo: string;
  fechaCreacion: string; // LocalDate se maneja como string (YYYY-MM-DD)
  descripcion: string;
  estado: string;
  detalles: RequerimientoDetalle[]; // Relación @OneToMany
}