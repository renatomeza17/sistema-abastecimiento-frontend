import { Producto } from "../Producto";

export interface ProformaDetalle {
  idProformaDetalle?: number;
  // Omitimos la referencia cíclica a la Proforma padre
  producto: Producto; // Relación @ManyToOne a Producto completo
  cantidad: number;
  precioUnitario: number;
}