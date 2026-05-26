import { Proveedor } from "../Proveedor";
import { ProformaDetalle } from "./ProformaDetalle";
import { Requerimiento } from "./Requerimiento";

export interface Proforma {
  idProforma?: number;
  codigo: string;
  fechaRecepcion: string; // LocalDate se maneja como string
  precioTotal: number;
  estado: string;
  requerimiento: Requerimiento; // Relación @ManyToOne completa
  proveedor: Proveedor;         // Relación @ManyToOne completa
  productos: ProformaDetalle[]; // Relación @OneToMany (tu lista de detalles)
}